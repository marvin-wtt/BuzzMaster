import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';

type CastWindowFactory = () => BrowserWindow;

export default (windowFactory: CastWindowFactory) => {
  ipcMain.on('cast:open', open);
  ipcMain.on('cast:close', close);

  ipcMain.on('cast:updateGameState', forwardTo('onGameStateUpdate'));
  ipcMain.on('cast:updateLocale', forwardTo('onLocaleUpdate'));
  ipcMain.on('cast:updateControllers', forwardTo('onControllerUpdate'));

  let castWindow: BrowserWindow;

  function isCastWindowClosed(): boolean {
    return castWindow === undefined || castWindow.isDestroyed();
  }

  function open() {
    if (isCastWindowClosed()) {
      castWindow = windowFactory();
    }
  }

  function close() {
    castWindow.close();
  }

  function forwardTo(name: string) {
    return (event: IpcMainEvent, ...args: unknown[]) => {
      if (isCastWindowClosed()) {
        return;
      }

      castWindow.webContents.send(`cast:${name}`, ...args);
    };
  }
};
