import { ref, shallowRef, onScopeDispose, type Ref } from 'vue';
import {
  type PowerPointConfig,
  createConfig,
  loadConfig,
} from '@/../common/powerpoint/PowerPointConfig';

/**
 * Served by BuzzMaster itself, not by Microsoft's CDN.
 *
 * BuzzMaster works offline and the add-in has to hold to that: a quiz night in a
 * hall with no wifi must not fail because a script could not be fetched.
 *
 * This works because office.js resolves its companion scripts — the host-specific
 * bundle and the localised strings — relative to its own `<script src>`. Serving
 * the loader from here means those come from here too, and nothing touches the
 * network. `scripts/sync-office-js.mjs` puts them in place.
 */
const OFFICE_JS_URL = '/office-js/office.js';

const SETTINGS_KEY = 'buzzmaster.config';

/** How long to wait for Office.js before giving up and showing an error. */
const READY_TIMEOUT_MS = 15_000;

export type OfficeView = 'edit' | 'read';

export type OfficeStatus =
  'loading' | 'ready' | 'unavailable' | 'config-too-new' | 'error';

let officeJsPromise: Promise<void> | undefined;

/**
 * Load Office.js on demand.
 *
 * Microsoft's guidance is to reference office.js from the CDN in the document
 * head. Phase 0 (Q6) established that injecting it after load works just as well
 * in PowerPoint on Windows — that finding is what allows the add-in to live as a
 * route inside the normal Quasar app instead of a separate build (decision D1).
 *
 * Consequences worth remembering:
 *  - the main and cast windows never pay for this script;
 *  - it is loaded from BuzzMaster's own server rather than the CDN, so the
 *    add-in stays offline-capable like the rest of the app (plan section 24).
 */
function loadOfficeJs(): Promise<void> {
  if (officeJsPromise) {
    return officeJsPromise;
  }

  officeJsPromise = new Promise<void>((resolve, reject) => {
    if (typeof Office !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = OFFICE_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          `Failed to load Office.js from ${OFFICE_JS_URL}. ` +
            'Run "npm run sync:office-js" if this is a development build.',
        ),
      );

    document.head.appendChild(script);
  });

  return officeJsPromise;
}

export interface UseOfficeResult {
  status: Ref<OfficeStatus>;
  view: Ref<OfficeView>;
  config: Ref<PowerPointConfig | undefined>;
  error: Ref<string | undefined>;
  /** Persist the current config into the document. Debounced. */
  save: () => void;
  /** Flush a pending debounced save immediately. */
  saveNow: () => Promise<void>;
}

/**
 * Bridge to the Office host for the PowerPoint add-in route.
 *
 * Everything Office-specific lives here so the presentation components stay
 * plain Vue and remain testable without mocking the whole Office object model.
 */
export function useOffice(): UseOfficeResult {
  const status = ref<OfficeStatus>('loading');
  const view = ref<OfficeView>('edit');
  const config = shallowRef<PowerPointConfig>();
  const error = ref<string>();

  let settings: Office.Settings | undefined;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  function fail(status_: OfficeStatus, message: string) {
    status.value = status_;
    error.value = message;
  }

  function readView() {
    Office.context.document.getActiveViewAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        view.value = result.value === 'read' ? 'read' : 'edit';
      }
    });
  }

  function readConfig() {
    const stored: unknown = settings?.get(SETTINGS_KEY);

    if (stored === undefined || stored === null) {
      // First run for this embedded element. Phase 0 (Q3) confirmed each element
      // gets its own settings store, so a fresh id here is genuinely per-element.
      config.value = createConfig(crypto.randomUUID());
      save();
      return;
    }

    const result = loadConfig(stored);

    if (result.ok) {
      config.value = result.config;
      return;
    }

    if (result.reason === 'too-new') {
      fail(
        'config-too-new',
        `This element was configured by a newer version of BuzzMaster (schema v${result.storedVersion}).`,
      );
      return;
    }

    // Malformed rather than newer: the stored value is unusable either way, but
    // discarding it silently would lose a user's configuration without telling
    // them. Surface it and start clean.
    fail(
      'error',
      'The saved configuration for this element could not be read.',
    );
    config.value = createConfig(crypto.randomUUID());
  }

  function save() {
    if (saveTimer !== undefined) {
      clearTimeout(saveTimer);
    }
    // Debounced so typing in a settings field does not call saveAsync per
    // keystroke (plan section 12).
    saveTimer = setTimeout(() => void saveNow(), 400);
  }

  async function saveNow(): Promise<void> {
    if (saveTimer !== undefined) {
      clearTimeout(saveTimer);
      saveTimer = undefined;
    }

    if (!settings || !config.value) {
      return;
    }

    settings.set(SETTINGS_KEY, config.value);

    await new Promise<void>((resolve) => {
      settings?.saveAsync((result) => {
        if (result.status !== Office.AsyncResultStatus.Succeeded) {
          // Not fatal: saveAsync writes into PowerPoint's in-memory document,
          // and the file only reaches disk when PowerPoint itself saves.
          console.error('Failed to persist add-in settings', result.error);
        }
        resolve();
      });
    });
  }

  const timeout = setTimeout(() => {
    if (status.value === 'loading') {
      fail(
        'unavailable',
        'Office.js did not initialise. This page only works inside PowerPoint.',
      );
    }
  }, READY_TIMEOUT_MS);

  loadOfficeJs()
    .then(() => Office.onReady())
    .then((info) => {
      clearTimeout(timeout);

      if (info.host !== Office.HostType.PowerPoint) {
        fail('unavailable', 'This add-in only supports PowerPoint.');
        return;
      }

      settings = Office.context.document.settings;

      readConfig();
      readView();

      // Phase 0 (Q5) confirmed the add-in is not torn down when entering Slide
      // Show and that this event fires reliably in both directions.
      Office.context.document.addHandlerAsync(
        Office.EventType.ActiveViewChanged,
        (args: { activeView: string }) => {
          view.value = args.activeView === 'read' ? 'read' : 'edit';
        },
      );

      if (status.value === 'loading') {
        status.value = 'ready';
      }
    })
    .catch((reason: unknown) => {
      clearTimeout(timeout);
      fail('unavailable', String(reason));
    });

  onScopeDispose(() => {
    clearTimeout(timeout);
    if (saveTimer !== undefined) {
      clearTimeout(saveTimer);
    }
  });

  return { status, view, config, error, save, saveNow };
}
