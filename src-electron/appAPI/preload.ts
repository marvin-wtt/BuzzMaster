import { ipcRenderer } from 'electron';
import type { AppAPI } from '@/../common/AppAPI';

const api: AppAPI = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  getLocale: () => ipcRenderer.invoke('app:getLocale'),
  setLocale: (locale: string) => ipcRenderer.send('app:setLocale', locale),

  getPowerPointStatus: () => ipcRenderer.invoke('app:getPowerPointStatus'),
  setPowerPointEnabled: (enabled: boolean) =>
    ipcRenderer.invoke('app:setPowerPointEnabled', enabled),

  onUpdateInfo: (callback) =>
    ipcRenderer.on('app:updateInfo', (event, value) => callback(value)),

  checkForUpdate: () => ipcRenderer.send('app:checkForUpdate'),
  downloadUpdate: () => ipcRenderer.send('app:downloadUpdate'),
  cancelUpdate: () => ipcRenderer.send('app:cancelUpdate'),
  installUpdate: () => ipcRenderer.send('app:installUpdate'),
};

export default api;
