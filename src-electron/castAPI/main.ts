import {
  type BrowserWindow,
  ipcMain,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
  type WebContents,
} from 'electron';
import log from 'electron-log';
import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';
import { CastBroadcaster } from '@/../src-electron/castAPI/CastBroadcaster';

type CastWindowFactory = () => Promise<BrowserWindow>;

/**
 * Cast IPC bridge.
 *
 * The snapshot used to be an untyped `Record<string, unknown[]>` of the last
 * arguments per channel (plan section 17). It is now a typed `CastSnapshot`
 * owned by `CastBroadcaster`, which also lets non-IPC surfaces — the PowerPoint
 * add-in — receive the same stream without duplicating the fan-out logic.
 */
export default (windowFactory: CastWindowFactory) => {
  const broadcaster = new CastBroadcaster();

  ipcMain.on('cast:ready', ready);
  ipcMain.on('cast:toggle', toggle);
  ipcMain.handle('cast:isOpen', isOpen);

  ipcMain.on('cast:updateGameState', (_event, state: GameState | undefined) => {
    broadcaster.updateGameState(state);
  });
  ipcMain.on('cast:updateGameSettings', (_event, settings: GameSettings) => {
    broadcaster.updateGameSettings(settings);
  });
  ipcMain.on('cast:updateLocale', (_event, locale: string) => {
    broadcaster.updateLocale(locale);
  });
  ipcMain.on(
    'cast:updateControllers',
    (_event, controllers: Record<string, string>) => {
      broadcaster.updateControllers(controllers);
    },
  );

  let castWindow: BrowserWindow | undefined;
  // The window controlling the cast window, notified whenever it opens or closes
  let host: WebContents | undefined;

  function isCastWindowClosed(): boolean {
    return castWindow === undefined || castWindow.isDestroyed();
  }

  // The cast window is just another sink. IPC remains its transport (section 31).
  broadcaster.subscribe((event) => {
    if (isCastWindowClosed()) {
      return;
    }

    switch (event.kind) {
      case 'gameState':
        castWindow?.webContents.send('cast:onGameStateUpdate', event.state);
        break;
      case 'gameSettings':
        castWindow?.webContents.send(
          'cast:onGameSettingsUpdate',
          event.settings,
        );
        break;
      case 'controllers':
        castWindow?.webContents.send(
          'cast:onControllerUpdate',
          event.controllers,
        );
        break;
      case 'locale':
        castWindow?.webContents.send('cast:onLocaleUpdate', event.locale);
        break;
    }
  });

  /**
   * Replay the current snapshot into a freshly opened cast window.
   *
   * Sent as individual events rather than one snapshot message so the renderer's
   * existing `CastReceiverAPI` is unchanged.
   */
  function ready(event: IpcMainEvent): void {
    const snapshot = broadcaster.snapshot;

    if (snapshot.gameSettings) {
      event.sender.send('cast:onGameSettingsUpdate', snapshot.gameSettings);
    }
    event.sender.send('cast:onControllerUpdate', snapshot.controllers);
    event.sender.send('cast:onLocaleUpdate', snapshot.locale);
    // Game state last: the cast store routes on it, so the other values should
    // already be in place when the route changes.
    event.sender.send('cast:onGameStateUpdate', snapshot.gameState);
  }

  function isOpen(event: IpcMainInvokeEvent): boolean {
    host = event.sender;

    return !isCastWindowClosed();
  }

  function toggle(event: IpcMainEvent) {
    host = event.sender;

    if (!isCastWindowClosed()) {
      // The close listener notifies the host
      castWindow?.close();
      return;
    }

    windowFactory()
      .then((window) => {
        castWindow = window;
        window.on('closed', () => {
          notifyHost(false);
        });
        notifyHost(true);
      })
      .catch((reason) => {
        log.error(`Failed to create cast window: ${reason}`);
      });
  }

  function notifyHost(open: boolean) {
    if (host === undefined || host.isDestroyed()) {
      return;
    }

    host.send('cast:onCastWindowUpdate', open);
  }

  return broadcaster;
};
