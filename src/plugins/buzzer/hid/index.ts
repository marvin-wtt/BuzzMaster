import { IBuzzerApi, IDevice, IBuzzerPlugin } from 'src/plugins/buzzer/types';
import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

// Maps all hidDevices to the corresponding buzzer devices to, so we can remove
//  the dongle once the device disconnects
const deviceMap: Map<HIDDevice, IDevice> = new Map<HIDDevice, IDevice>();

export const initHidDeviceManager: IBuzzerPlugin = async (api: IBuzzerApi) => {
  const hidDevices = await navigator.hid.getDevices();

  // Load all already connected devices
  for (const hidDevice of hidDevices) {
    const device = findHidDevice(hidDevice);

    deviceMap.set(hidDevice, device);
    await api.addDevice(device);
  }

  // Handle new devices
  navigator.hid.addEventListener('connect', async (event) => {
    const { device: hidDevice } = event;
    const device = findHidDevice(hidDevice);
    if (!device) {
      throw new Error('');
    }

    deviceMap.set(hidDevice, device);
    await api.addDevice(device);
  });

  // Handle device disconnection
  navigator.hid.addEventListener('disconnect', (event) => {
    const { device: hidDevice } = event;

    const device = deviceMap.get(hidDevice);
    if (!device) {
      return;
    }

    const index = api.dongles.value.findIndex(
      (dongle) => dongle.device === device
    );
    if (index === -1) {
      return;
    }

    api.dongles.value.splice(index, 1);
  });
};

/**
 * Map the hid device to the corresponding buzzer device but USB vendor and
 * product ID.
 *
 * @param hidDevice A new HIDDevice
 * @throws Error When device is unknown
 */
const findHidDevice = (hidDevice: HIDDevice): IDevice => {
  // Sony corp
  if (hidDevice.vendorId === 0x054c) {
    // Sony has two different models for PlayStation Buzz controllers
    if (hidDevice.productId === 0x02) {
      return new PlayStationDevice(hidDevice);
    }
    if (hidDevice.productId === 0x1000) {
      return new PlayStationDevice(hidDevice);
    }
  }

  throw `Unknown HID device. VendorId: ${hidDevice.vendorId}, ProductId: ${hidDevice.productId}`;
};
