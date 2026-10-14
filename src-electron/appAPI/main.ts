import { app, ipcMain } from 'electron';
import Store from 'electron-store';
import type { PowerPointIntegrationStatus } from '@/../common/AppAPI';

export interface AppApiHooks {
  /** Current integration state, for the settings UI. */
  powerPointStatus: () => Promise<PowerPointIntegrationStatus>;
  /** Turn the integration on or off, returning the resulting state. */
  setPowerPointEnabled: (
    enabled: boolean,
  ) => Promise<PowerPointIntegrationStatus>;
}

export default (hooks: AppApiHooks) => {
  const store = new Store({
    schema: {
      locale: {
        type: 'string',
      },
      powerpointEnabled: {
        type: 'boolean',
      },
    },
  });

  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getLocale', () =>
    store.get('locale', app.getSystemLocale()),
  );
  ipcMain.on('app:setLocale', (_, locale) => {
    store.set('locale', locale);
  });

  ipcMain.handle('app:getPowerPointStatus', () => hooks.powerPointStatus());
  ipcMain.handle('app:setPowerPointEnabled', (_, enabled: boolean) =>
    hooks.setPowerPointEnabled(enabled),
  );
};

/**
 * Whether the PowerPoint integration is switched on.
 *
 * **Defaults to off.** Enabling it installs a trusted certificate into the
 * user's certificate store and writes an Office registry entry — real changes to
 * someone's machine, and disproportionate for the majority of users who will
 * never open PowerPoint. Opting in should be a deliberate act.
 */
export function isPowerPointEnabled(): boolean {
  const store = new Store<{ powerpointEnabled?: boolean }>();
  return store.get('powerpointEnabled', false) === true;
}

export function setPowerPointEnabledSetting(enabled: boolean): void {
  const store = new Store<{ powerpointEnabled?: boolean }>();
  store.set('powerpointEnabled', enabled);
}
