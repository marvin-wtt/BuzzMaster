export type WindowAPI = {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  pin: () => void;
  unpin: () => void;
  mute: () => void;
  unmute: () => void;
  openDevTools: () => void;
};
