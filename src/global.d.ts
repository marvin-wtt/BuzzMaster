import { WindowAPI } from 'app/src-electron/windowAPI';
import { AppAPI } from 'app/src-electron/appAPI';

export {};

declare global {
  interface Window {
    windowAPI: WindowAPI;
    appAPI: AppAPI;
  }
}
