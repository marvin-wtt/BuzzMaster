import { GameState } from 'app/common/gameState';
import { ipcRenderer } from 'electron';
import { CastAPI } from 'app/common';

const api: CastAPI = {
  open: () => ipcRenderer.send('cast:open'),
  close: () => ipcRenderer.send('cast:close'),
  updateGameState: (state: GameState | undefined) =>
    ipcRenderer.send('cast:updateGameState', state),
  onGameStateUpdate: (callback: (state: GameState | undefined) => void) =>
    ipcRenderer.on('cast:onGameStateUpdate', (_event, value) =>
      callback(value),
    ),
  updateLocale: (locale: string) =>
    ipcRenderer.send('cast:updateLocale', locale),
  onLocaleUpdate: (callback: (locale: string) => void) =>
    ipcRenderer.on('cast:onLocaleUpdate', (_event, value) => callback(value)),
};

export default api;
