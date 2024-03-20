import { app, BrowserWindow } from 'electron';
import initWindowApiHandler from 'app/src-electron/windowAPI/main';
import initAppApiHandler from 'app/src-electron/appAPI/main';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'node:url';
import log from 'electron-log';
import electronUpdater, { type AppUpdater } from 'electron-updater';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

log.initialize();

function getPreloadPath(name: string): string {
  return path.resolve(
    currentDir,
    path.join(
      process.env.QUASAR_ELECTRON_PRELOAD_FOLDER!,
      name + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
    ),
  );
}

function createWindow() {
  const electronPreload = getPreloadPath('electron-preload');
  /**
   * Initial window options
   */
  const mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 500,
    height: 800,
    useContentSize: true,
    frame: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      preload: electronPreload,
    },
  });

  /**
   * Set permissions for buzzer devices
   */
  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType !== 'hid') {
      return false;
    }

    // NOTE: Devices need to be added in src/plugins/buzzer/hid/index.ts too.
    if (
      details.device.vendorId === 0x054c &&
      details.device.productId === 0x02
    ) {
      return true;
    }

    if (
      details.device.vendorId === 0x054c &&
      details.device.productId === 0x1000
    ) {
      return true;
    }

    // Add other devices here

    return false;
  });

  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL);
  } else {
    mainWindow.loadFile('index.html');
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.webContents.setWindowOpenHandler((/* details */) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        frame: false,
        webPreferences: {
          preload: electronPreload,
        },
      },
    };
  });
}

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

const startAutoUpdater = () => {
  const autoUpdater = getAutoUpdater();
  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify();
};

app.whenReady().then(() => {
  initAppApiHandler();
  initWindowApiHandler();
  createWindow();

  startAutoUpdater();
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
