import type { AppAPI, WindowAPI, CastAPI } from 'app/common';

export {};

declare global {
  interface Window {
    windowAPI: WindowAPI;
    appAPI: AppAPI;
    castAPI: CastAPI;
  }
}
