import { ipcRenderer } from 'electron';
import { AppAPI } from 'app/common/AppAPI';

const api: AppAPI = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  onUpdateInfo: (callback) =>
    ipcRenderer.on('app:updateInfo', (event, value) => callback(value)),

  checkForUpdate: () => ipcRenderer.send('app:checkForUpdate'),
  downloadUpdate: () => ipcRenderer.send('app:downloadUpdate'),
  cancelUpdate: () => ipcRenderer.send('app:cancelUpdate'),
  installUpdate: () => ipcRenderer.send('app:installUpdate'),
};

export default api;
