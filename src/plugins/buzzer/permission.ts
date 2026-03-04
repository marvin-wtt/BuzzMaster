import { PlayStation2Device } from 'src/plugins/buzzer/hid/PlayStation2Device';
import { PlayStation3Device } from 'src/plugins/buzzer/hid/PlayStation3Device';

export async function requestBuzzerDevicePermissions() {
  const devices = await navigator.hid.requestDevice({
    filters: [
      {
        vendorId: PlayStation2Device.VENDOR_ID,
        productId: PlayStation2Device.PRODUCT_ID,
      },
      {
        vendorId: PlayStation3Device.VENDOR_ID,
        productId: PlayStation3Device.PRODUCT_ID,
      },
    ],
  });

  return devices.length;
}
