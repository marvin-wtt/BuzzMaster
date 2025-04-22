import { type IpcMainEvent, BrowserWindow, ipcMain } from 'electron';
import type { WindowAPI } from 'app/common/WindowAPI';

type Handler = Record<
  keyof WindowAPI,
  (e: IpcMainEvent, ...args: unknown[]) => void
>;

export default () => {
  ipcMain.on('window:close', windowApiHandler.close);
  ipcMain.on('window:minimize', windowApiHandler.minimize);
  ipcMain.on('window:toggle-maximize', windowApiHandler.toggleMaximize);
  ipcMain.on('window:pin', windowApiHandler.pin);
  ipcMain.on('window:unpin', windowApiHandler.unpin);
  ipcMain.on('window:mute', windowApiHandler.mute);
  ipcMain.on('window:unmute', windowApiHandler.unmute);
  ipcMain.on('window:open-dev-tools', windowApiHandler.openDevTools);
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

const windowApiHandler: Handler = {
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

  mute: windowEventWrapper((win: BrowserWindow) => {
    win.webContents.setAudioMuted(true);
  }),

  unmute: windowEventWrapper((win: BrowserWindow) => {
    win.webContents.setAudioMuted(false);
  }),

  openDevTools: windowEventWrapper((win: BrowserWindow) => {
    win.webContents.openDevTools();
  }),
};
