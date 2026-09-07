import { BrowserWindow, ipcMain, type IpcMainEvent } from 'electron';
import log from 'electron-log';

type CastWindowFactory = () => Promise<BrowserWindow>;

export default (windowFactory: CastWindowFactory) => {
  ipcMain.on('cast:ready', ready);
  ipcMain.on('cast:toggle', toggle);
  ipcMain.on('cast:requestWindowState', sendStateTo);
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

  function sendStateTo(event: IpcMainEvent): void {
    event.sender.send('cast:windowState', !isCastWindowClosed());
  }

  /**
   * Tells every window but the cast window itself whether the cast window is
   * currently open, so the main window can show it in its status strip. The
   * cast window may also be closed from its own title bar, which is why this
   * is pushed rather than only answered on request.
   */
  function broadcastState(): void {
    const open = !isCastWindowClosed();

    BrowserWindow.getAllWindows().forEach((window) => {
      if (window === castWindow || window.isDestroyed()) {
        return;
      }

      window.webContents.send('cast:windowState', open);
    });
  }

  function toggle() {
    if (isCastWindowClosed()) {
      windowFactory()
        .then((window) => {
          castWindow = window;
          castWindow.on('closed', broadcastState);
          broadcastState();
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
