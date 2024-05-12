import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';

type CastWindowFactory = () => BrowserWindow;

export default (windowFactory: CastWindowFactory) => {
  ipcMain.on('cast:toggle', toggle);
  ipcMain.on('cast:updateGameState', forwardTo('onGameStateUpdate'));
  ipcMain.on('cast:updateGameSettings', forwardTo('onGameSettingsUpdate'));
  ipcMain.on('cast:updateLocale', forwardTo('onLocaleUpdate'));
  ipcMain.on('cast:updateControllers', forwardTo('onControllerUpdate'));
  ipcMain.on('cast:updateLeaderboard', forwardTo('onLeaderboardUpdate'));

  let castWindow: BrowserWindow;

  function isCastWindowClosed(): boolean {
    return castWindow === undefined || castWindow.isDestroyed();
  }

  function toggle() {
    if (isCastWindowClosed()) {
      castWindow = windowFactory();
    } else {
      castWindow.close();
    }
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
