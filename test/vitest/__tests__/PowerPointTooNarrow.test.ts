import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { mountPage } from '@/../test/vitest/utils/mount';
import { selector } from '@/../test/vitest/utils/element-selector';
import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import { CAST_MIN_WIDTH } from '@/../common/castWindow';
import PowerPointPage from '@/pages/PowerPointPage.vue';
import messages from '@/i18n';

installQuasarPlugin();

/**
 * Minimal Office host stub: enough for `useOffice` to reach `ready` and report a
 * view, which is what the warning depends on.
 */
const stubOffice = (view: 'edit' | 'read') => {
  (globalThis as { Office?: unknown }).Office = {
    onReady: () => Promise.resolve({ host: 'PowerPoint', platform: 'PC' }),
    HostType: { PowerPoint: 'PowerPoint' },
    AsyncResultStatus: { Succeeded: 0, Failed: 1 },
    EventType: { ActiveViewChanged: 'documentActiveViewChanged' },
    context: {
      document: {
        settings: {
          get: () => null,
          set: () => undefined,
          saveAsync: (cb?: (r: unknown) => void) => cb?.({ status: 0 }),
        },
        getActiveViewAsync: (cb: (r: unknown) => void) =>
          cb({ status: 0, value: view }),
        addHandlerAsync: () => undefined,
      },
    },
  };
};

/**
 * A slide element can be dragged to any size, unlike the cast window, which
 * Electron refuses to shrink below `CAST_MIN_WIDTH`. So the author is warned
 * rather than prevented — but only while authoring.
 */
describe('too-narrow warning', () => {
  let width = CAST_MIN_WIDTH;

  beforeEach(() => {
    // happy-dom reports zero-size boxes, so the measurement is stubbed to make
    // the threshold the thing under test rather than the layout engine.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ width }) as DOMRect,
    );
  });

  afterEach(() => {
    delete (globalThis as { Office?: unknown }).Office;
    vi.restoreAllMocks();
  });

  const mountReady = async (view: 'edit' | 'read', elementWidth: number) => {
    width = elementWidth;
    stubOffice(view);
    const { wrapper } = mountPage(PowerPointPage);
    await flushPromises();
    return wrapper;
  };

  it('warns while editing a too-narrow element', async () => {
    const wrapper = await mountReady('edit', CAST_MIN_WIDTH - 1);

    expect(wrapper.find(selector('pp-too-narrow')).exists()).toBe(true);
  });

  it('tells the author the actual threshold', () => {
    // The rendered text cannot be asserted here: the shared vue-i18n stub in
    // setup-file.ts returns keys rather than interpolating. Checking the message
    // itself is what proves the number reaches the user rather than being
    // hardcoded into prose that could drift from CAST_MIN_WIDTH.
    for (const locale of ['en-US', 'de-DE', 'es-ES', 'nl-NL'] as const) {
      expect(
        messages[locale].powerpoint.config.tooNarrow,
        `${locale} must interpolate the threshold`,
      ).toContain('{min}');
    }
  });

  it('never warns during Slide Show', async () => {
    // The element is facing an audience there. The warning is for the author,
    // who is the only person who can act on it, and only while authoring.
    const wrapper = await mountReady('read', CAST_MIN_WIDTH - 1);

    expect(wrapper.find(selector('pp-too-narrow')).exists()).toBe(false);
  });

  it('stays quiet at exactly the minimum width', async () => {
    const wrapper = await mountReady('edit', CAST_MIN_WIDTH);

    expect(wrapper.find(selector('pp-too-narrow')).exists()).toBe(false);
  });

  it('stays quiet when comfortably wide', async () => {
    const wrapper = await mountReady('edit', CAST_MIN_WIDTH * 2);

    expect(wrapper.find(selector('pp-too-narrow')).exists()).toBe(false);
  });

  it('does not warn before Office is ready', async () => {
    // A warning stacked over the loading state would just be noise.
    width = CAST_MIN_WIDTH - 100;
    (globalThis as { Office?: unknown }).Office = {
      onReady: () => new Promise(() => undefined),
    };
    const { wrapper } = mountPage(PowerPointPage);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(selector('pp-too-narrow')).exists()).toBe(false);
  });

  it('survives an environment without ResizeObserver', () => {
    // Degrading to a less responsive measurement is fine; crashing on a slide
    // is not.
    stubOffice('edit');
    const original = globalThis.ResizeObserver;
    // @ts-expect-error - deliberately removing it
    delete globalThis.ResizeObserver;

    expect(() => mount(PowerPointPage)).not.toThrow();

    globalThis.ResizeObserver = original;
  });
});

describe('CAST_MIN_WIDTH', () => {
  it('is shared rather than duplicated per surface', () => {
    // The same number bounds the cast window and warns the slide author, so the
    // two cannot disagree about what "too small" means.
    expect(CAST_MIN_WIDTH).toBe(400);
  });
});
