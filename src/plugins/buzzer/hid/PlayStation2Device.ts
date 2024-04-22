import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

export class PlayStation2Device extends PlayStationDevice {
  constructor(device: HIDDevice) {
    super(device);
  }
}
