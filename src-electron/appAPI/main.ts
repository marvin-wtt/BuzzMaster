import { app, ipcMain } from 'electron';

export default () => {
  ipcMain.handle('app:getVersion', () => app.getVersion());
};
