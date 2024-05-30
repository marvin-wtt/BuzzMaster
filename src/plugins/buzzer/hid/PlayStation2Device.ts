import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

export class PlayStation2Device extends PlayStationDevice {
  readonly energySavingDelay: undefined;

  constructor(device: HIDDevice) {
    super(device);
  }
}
