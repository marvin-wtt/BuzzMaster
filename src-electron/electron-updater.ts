import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import electronUpdater, {
  type AppUpdater,
  type CancellationToken,
} from 'electron-updater';
import type { AppUpdate } from 'app/common';

function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

const startAutoUpdater = async () => {
  const autoUpdater = getAutoUpdater();
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  await autoUpdater.checkForUpdates();
};

app
  .whenReady()
  .then(startAutoUpdater)
  .catch((reason) => {
    console.error(`Failed to start application: ${reason}`);
  });

let cancellationToken: CancellationToken | undefined;

const autoUpdater = getAutoUpdater();
autoUpdater.on('checking-for-update', () => {
  send({
    name: 'checking-for-update',
  });
});
autoUpdater.on('update-cancelled', (info) => {
  cancellationToken = undefined;
  send({
    name: 'update-cancelled',
    info,
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
autoUpdater.on('error', (error) => {
  send({
    name: 'error',
    error,
  });
});
autoUpdater.on('download-progress', (info) => {
  send({
    name: 'download-progress',
    info,
  });
});

autoUpdater.on('update-downloaded', (info) => {
  cancellationToken = undefined;
  send({
    name: 'update-downloaded',
    info,
  });
});

ipcMain.on('app:checkForUpdate', () => {
  void autoUpdater.checkForUpdates();
});
ipcMain.on('app:downloadUpdate', () => {
  if (cancellationToken) {
    return;
  }
  void autoUpdater.downloadUpdate(cancellationToken);
});
ipcMain.on('app:cancelUpdate', () => {
  cancellationToken?.cancel();
  cancellationToken = undefined;
});
ipcMain.on('app:installUpdate', () => {
  autoUpdater.quitAndInstall();
});

function send(update: AppUpdate) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('app:updateInfo', update);
  });
}
