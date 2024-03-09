import { IpcMainEvent, BrowserWindow, ipcMain } from 'electron';

export type WindowAPI = {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  pin: () => void;
  unpin: () => void;
};

export const initWindowApiHandler = () => {
  ipcMain.on('close', windowApiHandler.close);
  ipcMain.on('minimize', windowApiHandler.minimize);
  ipcMain.on('toggle-maximize', windowApiHandler.toggleMaximize);
  ipcMain.on('pin', windowApiHandler.pin);
  ipcMain.on('unpin', windowApiHandler.unpin);
};

const windowEventWrapper = (next: (window: BrowserWindow) => void) => {
  return (event: IpcMainEvent) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);

    if (!win) {
      return;
    }

    next(win);
  };
};

const windowApiHandler = {
  minimize: windowEventWrapper((win: BrowserWindow) => {
    win.minimize();
  }),

  toggleMaximize: windowEventWrapper((win: BrowserWindow) => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }),

  close: windowEventWrapper((win: BrowserWindow) => {
    win.close();
  }),

  pin: windowEventWrapper((win: BrowserWindow) => {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    win.setAlwaysOnTop(true, 'pop-up-menu', 1);
  }),

  unpin: windowEventWrapper((win: BrowserWindow) => {
    win.setAlwaysOnTop(false);
  }),
};
