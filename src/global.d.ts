import type { AppAPI, WindowAPI, CastAPI } from '@/../common';
import type { PowerPointAPI } from '@/../common/PowerPointAPI';

export {};

declare global {
  interface Window {
    windowAPI: WindowAPI;
    appAPI: AppAPI;
    castAPI: CastAPI;
    powerPointAPI?: PowerPointAPI;
  }
}
