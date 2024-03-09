import { WindowAPI } from 'app/src-electron/windowAPI';

export {};

declare global {
  interface Window {
    windowAPI: WindowAPI;
  }
}
