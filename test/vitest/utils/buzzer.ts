import type {
  ButtonState,
  BuzzerButton,
  IController,
  IDevice,
  IDongle,
} from 'src/plugins/buzzer/types';
import type { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';

export const createDevice = async (
  plugin: BuzzerApi,
  controllerCount: number = 2,
) => {
  const device: IDevice = {
    id: 'test-1',
    controllers: controllerCount,
    energySavingDelay: undefined,
    prepare: () => undefined,
    reset: () => undefined,
    buttonUpdateHandler: () => undefined,
    updateLight: () => undefined,
    close: () => undefined,
  };

  await plugin.addDevice(device);

  const buttonStates: ButtonState[] = Array.from(
    { length: 5 * controllerCount },
    (_, i) => {
      return {
        controller: Math.floor(i / 5),
        pressed: false,
        button: (i % 5) as BuzzerButton,
      };
    },
  );

  const updateButton = (
    controller: number,
    button: BuzzerButton,
    pressed: boolean,
  ) => {
    buttonStates[controller * button.valueOf()] = {
      controller,
      pressed,
      button,
    };

    device.buttonUpdateHandler(buttonStates);
  };

  const pressAndRelease = (controller: number, button: BuzzerButton) => {
    updateButton(controller, button, true);
    updateButton(controller, button, false);
  };

  const getController = (index: number): IController => {
    const dongle = getDongle();

    if (index >= dongle.controllers.length) {
      throw new Error(
        'Controller does not exist. Make sure that there are enough controllers specified.',
      );
    }

    return dongle.controllers[index]!;
  };

  const getDongle = (): IDongle => {
    const dongle = plugin.dongles.find(
      (dongle) => dongle.device.id === device.id,
    );

    if (!dongle) {
      throw new Error('Cannot find dongle.');
    }

    return dongle;
  };

  return {
    device,
    updateButton,
    pressAndRelease,
    getController,
    getDongle,
  };
};
