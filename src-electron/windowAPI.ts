import { BrowserWindow } from '@electron/remote';

export const windowAPI = {
  minimize() {
    BrowserWindow.getFocusedWindow()?.minimize();
  },

  toggleMaximize() {
    const win = BrowserWindow.getFocusedWindow();

    if (!win) {
      return;
    }

    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  },

  close() {
    BrowserWindow.getFocusedWindow()?.close();
  },

  pin() {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      window.setAlwaysOnTop(true, 'screen-saver', 1);
    });
  },

  unpin() {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.setAlwaysOnTop(false);
    });
  },
};
