import { ipcRenderer } from 'electron';
import { AppAPI } from 'app/common/AppAPI';

const api: AppAPI = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
};

export default api;
