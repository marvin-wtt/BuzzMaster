import { IBuzzerApi, IDevice, IBuzzerPlugin } from 'src/plugins/buzzer/types';
import { PlayStationDevice } from 'src/plugins/buzzer/hid/PlayStationDevice';

// Maps all hidDevices to the corresponding buzzer devices to, so we can remove
//  the dongle once the device disconnects
const deviceMap: Map<HIDDevice, string> = new Map<HIDDevice, string>();

export const initHidDeviceManager: IBuzzerPlugin = async (api: IBuzzerApi) => {
  const hidDevices = await navigator.hid.getDevices();

  // Load all already connected devices
  for (const hidDevice of hidDevices) {
    const device = findHidDevice(hidDevice);

    deviceMap.set(hidDevice, device.id);
    await api.addDevice(device);
  }

  // Handle new devices
  navigator.hid.addEventListener('connect', async (event) => {
    const { device: hidDevice } = event;
    const device = findHidDevice(hidDevice);

    deviceMap.set(hidDevice, device.id);
    await api.addDevice(device);
  });

  // Handle device disconnection
  navigator.hid.addEventListener('disconnect', (event) => {
    const { device: hidDevice } = event;

    const deviceId = deviceMap.get(hidDevice);
    if (!deviceId) {
      return;
    }

    api.removeDevice(deviceId);
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
  // NOTE: Devices need to be added at src-electron/electron-amin.ts too.
  if (matchHidDevice(hidDevice, 0x054c, 0x02)) {
    return new PlayStationDevice(hidDevice);
  }

  if (matchHidDevice(hidDevice, 0x054c, 0x1000)) {
    return new PlayStationDevice(hidDevice);
  }

  throw `Unknown HID device. ProductName: ${hidDevice.productName}, ProductId: ${hidDevice.productId}, VendorId: ${hidDevice.vendorId}.`;
};

const matchHidDevice = (
  hidDevice: HIDDevice,
  vendorId: number,
  productId: number,
): boolean => {
  if (hidDevice.vendorId !== vendorId) {
    return false;
  }

  return productId === undefined || hidDevice.productId === productId;
};
