import { windowAPI } from 'app/src-electron/windowAPI';

export {};

declare global {
  interface Window {
    windowAPI: typeof windowAPI;
  }
}
