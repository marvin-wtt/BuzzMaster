import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { GameState } from 'app/common/gameState';

type CastWindowFactory = () => BrowserWindow;

export default (windowFactory: CastWindowFactory) => {
  ipcMain.on('cast:open', open);
  ipcMain.on('cast:close', close);

  ipcMain.on('cast:updateGameState', updateGameState);
  ipcMain.on('cast:updateLocale', updateLocale);

  let castWindow: BrowserWindow;

  function open() {
    if (castWindow === undefined || castWindow.isDestroyed()) {
      castWindow = windowFactory();
    }
  }

  function close() {
    castWindow.close();
  }

  function updateGameState(event: IpcMainEvent, state: GameState | undefined) {
    if (!castWindow) {
      return;
    }

    castWindow.webContents.send('cast:onGameStateUpdate', state);
  }

  function updateLocale(event: IpcMainEvent, locale: string) {
    if (!castWindow) {
      return;
    }

    castWindow.webContents.send('cast:onLocaleUpdate', locale);
  }
};
