import type { ButtonState, IDevice } from 'src/plugins/buzzer/types';
import { buttonMapping } from 'src/plugins/buzzer/hid/playstationButtonMappings';

export abstract class PlayStationDevice implements IDevice {
  static readonly VENDOR_ID = 0x054c;

  readonly id = crypto.randomUUID();
  readonly controllers = 4;
  buttonUpdateHandler: (states: ButtonState[]) => void = () => undefined;
  private lights: boolean[] = [false, false, false, false];

  abstract energySavingDelay: number | undefined;

  protected constructor(private device: HIDDevice) {}

  async prepare(): Promise<void> {
    if (!this.device.opened) {
      await this.device.open();
    }

    // Always reset device first to ensure all lights are off
    await this.reset();

    this.device.addEventListener(
      'inputreport',
      this.deviceInputListener.bind(this),
    );
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
    this.device.removeEventListener(
      'inputreport',
      this.deviceInputListener.bind(this),
    );
    await this.device.close();
  }

  deviceInputListener(event: HIDInputReportEvent) {
    const buttonStates = this.readDeviceData(event.data);
    this.buttonUpdateHandler(buttonStates);
  }

  readDeviceData(data: DataView): ButtonState[] {
    const uint8Array = new Uint8Array(data.buffer);

    return buttonMapping.map((mapping) => {
      const byte = uint8Array[mapping.byte];
      if (byte === undefined) {
        throw new Error(`Invalid button data at byte ${mapping.byte}`);
      }

      const pressed = (byte & mapping.mask) > 0;

      return {
        button: mapping.button,
        controller: mapping.controller,
        pressed,
      };
    });
  }
}
