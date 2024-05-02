import { ipcRenderer } from 'electron';
import { CastAPI, CastReceiverAPI, CastSenderAPI } from 'app/common';

const send =
  <K extends keyof CastSenderAPI>(name: K) =>
  (...arg: Parameters<CastSenderAPI[K]>): void => {
    ipcRenderer.send(`cast:${name}`, ...arg);
  };

const senderAPI: CastSenderAPI = {
  open: send('open'),
  close: send('close'),
  updateGameState: send('updateGameState'),
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
  onLocaleUpdate: on('onLocaleUpdate'),
  onControllerUpdate: on('onControllerUpdate'),
};

const api: CastAPI = {
  ...senderAPI,
  ...receiverAPI,
};

export default api;
