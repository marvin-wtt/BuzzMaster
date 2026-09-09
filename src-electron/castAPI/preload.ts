import { ipcRenderer } from 'electron';
import type {
  CastAPI,
  CastReceiverAPI,
  CastSenderAPI,
  CastWindowAPI,
} from '@/../common';

const send =
  <K extends keyof CastSenderAPI>(name: K) =>
  (...arg: Parameters<CastSenderAPI[K]>): void => {
    ipcRenderer.send(`cast:${name}`, ...arg);
  };

const senderAPI: CastSenderAPI = {
  ready: send('ready'),
  toggle: send('toggle'),
  updateGameState: send('updateGameState'),
  updateGameSettings: send('updateGameSettings'),
  updateLocale: send('updateLocale'),
  updateControllers: send('updateControllers'),
};

const on = <K extends keyof CastReceiverAPI>(name: K): CastReceiverAPI[K] => {
  // TODO Callback should accept multiple parameters
  const fn = (callback: (args: unknown) => void): void => {
    ipcRenderer.on(`cast:${name}`, (event, args) => callback(args));
  };

  return fn as CastReceiverAPI[K];
};

const receiverAPI: CastReceiverAPI = {
  onGameStateUpdate: on('onGameStateUpdate'),
  onGameSettingsUpdate: on('onGameSettingsUpdate'),
  onLocaleUpdate: on('onLocaleUpdate'),
  onControllerUpdate: on('onControllerUpdate'),
};

const castWindowAPI: CastWindowAPI = {
  isOpen: () => ipcRenderer.invoke('cast:isOpen') as Promise<boolean>,
  onCastWindowUpdate: (callback) => {
    ipcRenderer.on('cast:onCastWindowUpdate', (_event, open: boolean) =>
      callback(open),
    );
  },
};

const api: CastAPI = {
  ...senderAPI,
  ...receiverAPI,
  ...castWindowAPI,
};

export default api;
