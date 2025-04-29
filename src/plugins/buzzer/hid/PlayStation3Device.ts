import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

export class PlayStation3Device extends PlayStationDevice {
  static readonly PRODUCT_ID = 0x1000;

  readonly energySavingDelay = 20 * 60 * 1000;

  constructor(device: HIDDevice) {
    super(device);
  }
}
