import { ButtonState, IDevice } from 'src/plugins/buzzer/types';
import { buttonMapping } from 'src/plugins/buzzer/hid/playstationButtonMappings';

export class PlayStationDevice implements IDevice {
  buttonUpdateHandler: (states: ButtonState[]) => void = () => undefined;
  private lights: boolean[] = [false, false, false, false];

  constructor(private device: HIDDevice) {}

  async prepare(): Promise<void> {
    if (!this.device.opened) {
      await this.device.open();
    }

    // Always reset device first to ensure all lights are off
    await this.reset();

    this.device.addEventListener('inputreport', this.deviceInputListener);
  }

  async updateLight(controllerIndex: number, value: boolean): Promise<void> {
    this.lights[controllerIndex] = value;
    await this.sendLightUpdate();
  }

  async sendLightUpdate(): Promise<void> {
    // Map data to corresponding byte value.
    // https://gist.github.com/Lewiscowles1986/eef220dac6f0549e4702393a7b9351f6
    const ON = 0xff;
    const OFF = 0x00;
    const lightData = this.lights.map((l) => (l ? ON : OFF));

    // Light bytes are byte 1..4
    const data = new Uint8Array([0x00, ...lightData]);
    await this.device.sendReport(0, data);
  }

  async reset() {
    // Disable all lights
    this.lights = [false, false, false, false];
    await this.sendLightUpdate();
  }

  async close(): Promise<void> {
    this.device.removeEventListener('inputreport', this.deviceInputListener);
    await this.device.close();
  }

  deviceInputListener(event: HIDInputReportEvent) {
    const buttonStates = this.readDeviceData(event.data);
    this.buttonUpdateHandler(buttonStates);
  }

  readDeviceData(data: DataView): ButtonState[] {
    const uint8Array = new Uint8Array(data.buffer);

    return buttonMapping.map((value) => {
      const pressed = (uint8Array[value.byte] & value.mask) > 0;

      return {
        button: value.button,
        controller: value.controller,
        pressed,
      };
    });
  }
}
