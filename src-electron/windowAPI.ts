import { ipcMain, ipcRenderer, IpcMainEvent, BrowserWindow } from 'electron';

export const windowAPI = {
  minimize: () => ipcRenderer.invoke('minimize'),
  toggleMaximize: () => ipcRenderer.invoke('toggle-maximise'),
  close: () => ipcRenderer.invoke('close'),
  pin: () => ipcRenderer.invoke('pin'),
  unpin: () => ipcRenderer.invoke('unpin'),
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
