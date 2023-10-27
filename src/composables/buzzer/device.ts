import {
  ButtonMapping,
  ButtonState,
  BuzzerButton,
  Dongle,
} from 'src/composables/buzzer/types';
import { findDevice } from 'src/composables/buzzer/deviceInfo';

let dongleCount = 0;

export const Device = async (device: HIDDevice): Promise<Dongle> => {
  const buttonMappings = findDevice(
    device.vendorId,
    device.productId
  )?.BUTTON_MAPPING;
  if (!buttonMappings) {
    return Promise.reject('Unknown device');
  }

  const name = `Dongle ${++dongleCount}`;
  let previousState: ButtonState[] = intiButtonStates();

  const deviceInputListener = (event: HIDInputReportEvent) => {
    const { data } = event;

    const buttonStates = readDeviceData(data, buttonMappings);

    const changedStates = buttonStates.filter((state, index) => {
      // It is assumed, that the order of the previous buttons is identical thus the controller and button index is ignored.
      return previousState[index] !== state;
    });

    changedStates.forEach((button) => {
      console.log(name, button);
      // TODO fire event to listeners
      // General event
      if (button.pressed) {
        // Press event
      } else {
        // Release event
      }
    });

    previousState = buttonStates;
  };

  await device.open();
  device.addEventListener('inputreport', deviceInputListener);

  return {
    name,
    device,
  };
};

export const readDeviceData = (
  data: DataView,
  mapping: ButtonMapping[]
): ButtonState[] => {
  const uint8Array = new Uint8Array(data.buffer);

  return mapping.map((value) => {
    const pressed = (uint8Array[value.byte] & value.mask) > 0;

    return {
      button: value.button,
      controller: value.controller,
      pressed,
    };
  });
};

const intiButtonStates = (): ButtonState[] => {
  return Array.from(
    { length: 4 },
    (_, controller) =>
      Object.values(BuzzerButton).map((button) => ({
        controller,
        button: button as BuzzerButton,
        pressed: false,
      }))
  ).flat();
}
