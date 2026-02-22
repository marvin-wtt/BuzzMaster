import { type BrowserWindow, ipcMain, type IpcMainEvent } from 'electron';
import log from 'electron-log';

type CastWindowFactory = () => Promise<BrowserWindow>;

export default (windowFactory: CastWindowFactory) => {
  ipcMain.on('cast:ready', ready);
  ipcMain.on('cast:toggle', toggle);
  ipcMain.on('cast:updateGameState', forwardTo('onGameStateUpdate'));
  ipcMain.on('cast:updateGameSettings', forwardTo('onGameSettingsUpdate'));
  ipcMain.on('cast:updateLocale', forwardTo('onLocaleUpdate'));
  ipcMain.on('cast:updateControllers', forwardTo('onControllerUpdate'));

  let castWindow: BrowserWindow;
  const dataSnapshot: Record<string, unknown[]> = {};

  function isCastWindowClosed(): boolean {
    return castWindow === undefined || castWindow.isDestroyed();
  }

  function ready(event: IpcMainEvent): void {
    Object.entries(dataSnapshot).forEach(([name, args]) => {
      event.sender.send(`cast:${name}`, ...args);
    });
  }

  function toggle() {
    if (isCastWindowClosed()) {
      windowFactory()
        .then((window) => {
          castWindow = window;
        })
        .catch((reason) => {
          log.error(`Failed to create cast window: ${reason}`);
        });
    } else {
      castWindow.close();
    }
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
