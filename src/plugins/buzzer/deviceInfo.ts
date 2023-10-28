import { buttonMapping } from 'src/plugins/buzzer/buttonMappings';
import { ButtonMapping } from 'src/plugins/buzzer/types';

type DeviceInfo = {
  VENDOR_ID: number;
  PRODUCT_ID: number;
  BUTTON_MAPPING: ButtonMapping[];
};

export const devices: DeviceInfo[] = [
  {
    VENDOR_ID: 0x054c,
    PRODUCT_ID: 0x02,
    BUTTON_MAPPING: buttonMapping,
  },
  {
    VENDOR_ID: 0x054c,
    PRODUCT_ID: 0x1000,
    BUTTON_MAPPING: buttonMapping,
  },
];

export const findDevice = (
  vendorId: number,
  productId: number
): DeviceInfo | undefined => {
  return devices.find(
    (device) => device.VENDOR_ID === vendorId && device.PRODUCT_ID === productId
  );
};
