import { WindowAPI } from 'app/common/WindowAPI';
import { ipcRenderer } from 'electron';

const api: WindowAPI = {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  pin: () => ipcRenderer.send('window:pin'),
  unpin: () => ipcRenderer.send('window:unpin'),
  mute: () => ipcRenderer.send('window:mute'),
  unmute: () => ipcRenderer.send('window:unmute'),
  openDevTools: () => ipcRenderer.send('window:open-dev-tools'),
};

export default api;
