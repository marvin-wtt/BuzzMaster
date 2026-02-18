import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

export class PlayStation2Device extends PlayStationDevice {
  static readonly PRODUCT_ID = 0x02;

  readonly energySavingDelay: undefined;

  constructor(device: HIDDevice) {
    super(device);
  }
}
