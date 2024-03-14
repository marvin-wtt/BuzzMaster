import { WindowAPI } from 'src-electron/windowAPI';
import { ipcRenderer } from 'electron';

const api: WindowAPI = {
  minimize: () => ipcRenderer.send('minimize'),
  toggleMaximize: () => ipcRenderer.send('toggle-maximize'),
  close: () => ipcRenderer.send('close'),
  pin: () => ipcRenderer.send('pin'),
  unpin: () => ipcRenderer.send('unpin'),
  mute: () => ipcRenderer.send('unpin'),
  unmute: () => ipcRenderer.send('unmute'),
  openDevTools: () => ipcRenderer.send('open-dev-tools'),
};

export default api;
