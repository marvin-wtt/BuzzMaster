import type { IBuzzerApi, IDevice, IDongle } from 'src/plugins/buzzer/types';
import { reactive } from 'vue';
import { Dongle } from 'src/plugins/buzzer/Dongle';
import { ButtonEventEmitter } from 'src/plugins/buzzer/ButtonEventEmitter';
import { FindCoordinator } from 'src/plugins/buzzer/utils/FindCoordinator';

export class BuzzerApi extends ButtonEventEmitter implements IBuzzerApi {
  dongles = reactive<IDongle[]>([]);
  disconnectedDongles = reactive<IDongle[]>([]);

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

    const dongles = this.dongles.splice(index, 1);

    this.disconnectedDongles.push(...dongles);
  }

  restoreDongle(originalDongle: IDongle, newDongle: IDongle): void {
    if (newDongle.controllers.length !== originalDongle.controllers.length) {
      throw new Error(
        'Cannot restore dongle with different number of controllers',
      );
    }

    // Update device name
    newDongle.name = originalDongle.name;

    // Update all controllers
    for (let i = 0; i < originalDongle.controllers.length; i++) {
      const originalController = originalDongle.controllers[i]!;
      const controller = newDongle.controllers[i]!;

      // Manually copying properties to ensure only the intended attributes are restored.
      // If new attributes are added to the controller object in the future, they should
      // be explicitly restored here to maintain consistency.
      controller.id = originalController.id;
      controller.name = originalController.name;
      controller.disabled = originalController.disabled;
    }

    // Remove dongle from disconnected devices
    const index = this.disconnectedDongles.findIndex(
      (dongle) => dongle.device.id === originalDongle.device.id,
    );
    if (index === -1) {
      return;
    }

    this.disconnectedDongles.splice(index, 1);
  }

  async reset(): Promise<void> {
    FindCoordinator.stop();
    await Promise.all(this.dongles.map(async (dongle) => dongle.reset()));
  }
}
