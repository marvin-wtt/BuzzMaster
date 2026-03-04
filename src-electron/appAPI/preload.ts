import { ipcRenderer } from 'electron';
import type { AppAPI } from 'app/common/AppAPI';

const api: AppAPI = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  getLocale: () => ipcRenderer.invoke('app:getLocale'),
  setLocale: (locale: string) => ipcRenderer.send('app:setLocale', locale),

  onUpdateInfo: (callback) =>
    ipcRenderer.on('app:updateInfo', (event, value) => callback(value)),

  checkForUpdate: () => ipcRenderer.send('app:checkForUpdate'),
  downloadUpdate: () => ipcRenderer.send('app:downloadUpdate'),
  cancelUpdate: () => ipcRenderer.send('app:cancelUpdate'),
  installUpdate: () => ipcRenderer.send('app:installUpdate'),
};

export default api;
