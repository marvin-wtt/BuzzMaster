import {
  IBuzzerApi,
  IController,
  IDevice,
  IDongle,
} from 'src/plugins/buzzer/types';
import { ref, computed } from 'vue';
import { Dongle } from 'src/plugins/buzzer/Dongle';
import { ButtonEventEmitter } from 'src/plugins/buzzer/ButtonEventEmitter';

export class BuzzerApi extends ButtonEventEmitter implements IBuzzerApi {
  dongles = ref<IDongle[]>([]);
  controllers = computed<IController[]>(() => {
    return this.dongles.value
      .flatMap((dongle) => dongle.controllers)
      .filter((controller) => !controller.disabled);
  });

  async addDevice(device: IDevice): Promise<void> {
    // Prepare the device, so it's ready to accept commands and emit events
    await device.prepare();
    // Always reset on connection to ensure all lights are off
    await device.reset();

    const dongle = new Dongle(device);
    // Register all event listeners
    dongle.on('change', (e) => this.emit('change', e));
    dongle.on('press', (e) => this.emit('press', e));
    dongle.on('release', (e) => this.emit('release', e));

    this.dongles.value.push(dongle);
  }

  reset() {
    this.dongles.value.forEach((dongle) => dongle.reset());
  }
}
