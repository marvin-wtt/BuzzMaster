import { ButtonState, IDevice } from 'src/plugins/buzzer/types';
import { buttonMapping } from 'src/plugins/buzzer/hid/playstationButtonMappings';

export class PlayStationDevice implements IDevice {
  buttonUpdateHandler: (states: ButtonState[]) => void = () => undefined;
  private previousLLights: boolean[] = [false, false, false, false];

  constructor(private device: HIDDevice) {}

  async prepare(): Promise<void> {
    if (!this.device.opened) {
      await this.device.open();
    }

    this.device.addEventListener('inputreport', this.deviceInputListener);
  }

  async updateLight(controllerIndex: number, value: boolean): Promise<void> {
    const lights = Array(4).fill(undefined);
    lights[controllerIndex] = value;
    return this.updateLights(lights);
  }

  async updateLights(lights: (boolean | undefined)[]): Promise<void> {
    const updatedLights = lights.map((l, index) =>
      l !== undefined ? l : this.previousLLights[index]
    );

    // Map data to corresponding byte value.
    // https://gist.github.com/Lewiscowles1986/eef220dac6f0549e4702393a7b9351f6
    const ON = 0xff;
    const OFF = 0x00;
    const lightData = updatedLights.map((l) => (l ? ON : OFF));

    // Light bytes are byte 1..4
    const data = new Uint8Array([0x00, ...lightData]);

    await this.device.sendReport(0, data);

    this.previousLLights = updatedLights;
  }

  async reset() {
    // Disable all lights
    await this.updateLights([false, false, false, false]);
  }

  close(): void | Promise<void> {
    this.device.removeEventListener('inputreport', this.deviceInputListener);
    return this.device.close();
  }

  deviceInputListener(event: HIDInputReportEvent) {
    const { data } = event;

    const buttonStates = this.readDeviceData(data);
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
