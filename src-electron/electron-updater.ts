import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import electronUpdater, {
  type AppUpdater,
  CancellationToken,
} from 'electron-updater';
import { AppUpdate } from 'app/common';

app.whenReady().then(async () => {
  await startAutoUpdater();
});

function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

const startAutoUpdater = async () => {
  const autoUpdater = getAutoUpdater();
  autoUpdater.logger = log;
  registerEventListener();
  await autoUpdater.checkForUpdates();
};

function registerEventListener() {
  const autoUpdater = getAutoUpdater();
  autoUpdater.on('checking-for-update', () => {
    send({
      name: 'checking-for-update',
    });
  });
  autoUpdater.on('update-available', (info) => {
    send({
      name: 'update-available',
      info,
    });
  });
  autoUpdater.on('update-not-available', (info) => {
    send({
      name: 'update-not-available',
      info,
    });
  });
  autoUpdater.on('error', (err) => {
    send({
      name: 'error',
      error: err,
    });
  });
  autoUpdater.on('download-progress', (progressObj) => {
    send({
      name: 'download-progress',
      info: progressObj,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    send({
      name: 'update-downloaded',
      info,
    });
  });

  let cancellationToken: CancellationToken | undefined;
  ipcMain.on('app:checkForUpdate', async () => {
    await autoUpdater.checkForUpdates();
  });
  ipcMain.on('app:downloadUpdate', async () => {
    if (cancellationToken) {
      return;
    }
    await autoUpdater.downloadUpdate(cancellationToken);
  });
  ipcMain.on('app:cancelUpdate', () => {
    cancellationToken?.cancel();
    cancellationToken = undefined;
  });
  ipcMain.on('app:installUpdate', () => {
    autoUpdater.quitAndInstall();
  });
}

function send(update: AppUpdate) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('app:updateInfo', update);
  });
}
