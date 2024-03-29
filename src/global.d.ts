import { AppAPI, WindowAPI } from 'app/common';

export {};

declare global {
  interface Window {
    windowAPI: WindowAPI;
    appAPI: AppAPI;
  }
}
