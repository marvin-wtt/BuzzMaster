import { ipcRenderer } from 'electron';
import { AppAPI } from 'app/src-electron/appAPI/index';

const api: AppAPI = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
};

export default api;
