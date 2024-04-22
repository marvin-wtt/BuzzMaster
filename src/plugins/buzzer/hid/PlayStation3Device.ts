import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

export class PlayStation3Device extends PlayStationDevice {
  constructor(device: HIDDevice) {
    super(device);
  }
}
