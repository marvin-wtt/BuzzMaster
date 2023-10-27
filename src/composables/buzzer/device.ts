import {
  ButtonEventHandler,
  ButtonMapping,
  ButtonState,
  IController,
} from 'src/composables/buzzer/types';
import { findDevice } from 'src/composables/buzzer/deviceInfo';
import { Controller } from 'src/composables/buzzer/controller';

let dongleCount = 0;

export const Device = async (
  device: HIDDevice,
  handler: ButtonEventHandler
) => {
  const buttonMappings = findDevice(
    device.vendorId,
    device.productId
  )?.BUTTON_MAPPING;
  if (!buttonMappings) {
    return Promise.reject('Unknown device');
  }

  const name = `Dongle ${++dongleCount}`;
  let previousLLights: boolean[] = [false, false, false, false];

  const controllers: IController[] = Array.from({ length: 4 }, (_, i) => {
    const controller = Controller(
      `Controller ${dongleCount}-${i + 1}`
    ) as IController;
    controller.setLight = updateControllerLight(i);
    return controller;
  });

  const updateControllerLight = (controller: number) => {
    return async (value: boolean) => {
      const lights = Array(4).fill(undefined);
      lights[controller] = value;
      return updateLights(lights);
    };
  };

  const updateLights = async (lights: (boolean | undefined)[]) => {
    const updatedLights = lights.map((l, index) =>
      l !== undefined ? l : previousLLights[index]
    );

    const data = new Uint8Array([
      0x00,
      ...updatedLights.map((l) => (l ? 0xff : 0x00)),
    ]);

    await device.sendReport(0, data);

    previousLLights = updatedLights;
  };

  const deviceInputListener = (event: HIDInputReportEvent) => {
    const { data } = event;

    const buttonStates = readDeviceData(data, buttonMappings);

    const changedStates = buttonStates.filter((state) => {
      return controllers[state.controller].update(state);
    });

    // FIre events
    changedStates.forEach((state) => {
      handler({
        type: state.pressed ? 'pressed' : 'released',
        button: state.button,
        controller: controllers[state.controller],
      });
    });
  };

  const reset = async () => {
    // Disable all lights
    await updateLights([false, false, false, false]);
  };

  // Open device
  if (!device.opened) {
    await device.open();
  }
  await reset();

  device.addEventListener('inputreport', deviceInputListener);

  return {
    name,
    device,
    controllers,
    reset,
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
