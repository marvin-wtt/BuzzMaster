import { IBuzzerApi, IDevice, IDongle } from 'src/plugins/buzzer/types';
import { reactive } from 'vue';
import { Dongle } from 'src/plugins/buzzer/Dongle';
import { ButtonEventEmitter } from 'src/plugins/buzzer/ButtonEventEmitter';

export class BuzzerApi extends ButtonEventEmitter implements IBuzzerApi {
  dongles = reactive<IDongle[]>([]);

  async addDevice(device: IDevice): Promise<void> {
    // Prepare the device, so it's ready to accept commands and emit events
    await device.prepare();

    const dongle = new Dongle(device);
    // Register all event listeners
    dongle.on('change', (e) => this.emit('change', e));
    dongle.on('press', (e) => this.emit('press', e));
    dongle.on('release', (e) => this.emit('release', e));

    this.dongles.push(dongle);
  }

  removeDevice(deviceId: string): void {
    const index = this.dongles.findIndex(
      (dongle) => dongle.device.id === deviceId,
    );
    if (index === -1) {
      return;
    }

    this.dongles.splice(index, 1);
  }

  reset(): void {
    this.dongles.forEach((dongle) => dongle.reset());
  }
}
