import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

export class PlayStation3Device extends PlayStationDevice {
  readonly energySavingDelay = 20 * 60 * 1000;

  constructor(device: HIDDevice) {
    super(device);
  }
}
