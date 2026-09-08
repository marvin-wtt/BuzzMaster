import {
  type BrowserWindow,
  ipcMain,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
  type WebContents,
} from 'electron';
import log from 'electron-log';

type CastWindowFactory = () => Promise<BrowserWindow>;

export default (windowFactory: CastWindowFactory) => {
  ipcMain.on('cast:ready', ready);
  ipcMain.on('cast:toggle', toggle);
  ipcMain.handle('cast:isOpen', isOpen);
  ipcMain.on('cast:updateGameState', forwardTo('onGameStateUpdate'));
  ipcMain.on('cast:updateGameSettings', forwardTo('onGameSettingsUpdate'));
  ipcMain.on('cast:updateLocale', forwardTo('onLocaleUpdate'));
  ipcMain.on('cast:updateControllers', forwardTo('onControllerUpdate'));

  let castWindow: BrowserWindow;
  // The window controlling the cast window, notified whenever it opens or closes
  let host: WebContents | undefined;
  const dataSnapshot: Record<string, unknown[]> = {};

  function isCastWindowClosed(): boolean {
    return castWindow === undefined || castWindow.isDestroyed();
  }

  function ready(event: IpcMainEvent): void {
    Object.entries(dataSnapshot).forEach(([name, args]) => {
      event.sender.send(`cast:${name}`, ...args);
    });
  }

  function isOpen(event: IpcMainInvokeEvent): boolean {
    host = event.sender;

    return !isCastWindowClosed();
  }

  function toggle(event: IpcMainEvent) {
    host = event.sender;

    if (!isCastWindowClosed()) {
      // The close listener notifies the host
      castWindow.close();
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

  function forwardTo(name: string) {
    return (_event: IpcMainEvent, ...args: unknown[]) => {
      // Keep a snapshot of the last sent arguments for each event.
      dataSnapshot[name] = args;

      if (isCastWindowClosed()) {
        return;
      }

      castWindow.webContents.send(`cast:${name}`, ...args);
    };
  }
};
