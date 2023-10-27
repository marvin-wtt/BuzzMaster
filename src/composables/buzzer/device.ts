import {
  ButtonMapping,
  ButtonState,
  BuzzerButton,
  Dongle,
} from 'src/composables/buzzer/types';
import {devices, findDevice} from 'src/composables/buzzer/deviceInfo';

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
      return previousState[index].pressed !== state.pressed;
    });

    changedStates.forEach((state) => {
      console.log(name, state);

      setAllLights(
        state.pressed && state.controller === 0,
        state.pressed && state.controller === 1,
        state.pressed && state.controller === 2,
        state.pressed && state.controller === 3
      );

      // TODO fire event to listeners
      // General event
      if (state.pressed) {
        // Press event
      } else {
        // Release event
      }
    });

    previousState = buttonStates;
  };

  const setAllLights = async (l0: boolean, l1: boolean, l2: boolean, l3: boolean) => {
    const lights = [l0, l1, l2, l3];
    const data = new Uint8Array([0x00, 0x00, ...lights.map(l => l ? 0xff : 0x00)]);

    await device.sendReport(0, data);
  }

  if (!device.opened) {
    await device.open();
  }

  // Disable all lights
  await setAllLights(false, false, false, false);

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
