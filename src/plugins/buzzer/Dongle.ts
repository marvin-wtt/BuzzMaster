import {
  ButtonState,
  IController,
  IDevice,
  IDongle,
  LightApi,
} from 'src/plugins/buzzer/types';
import { Controller } from 'src/plugins/buzzer/Controller';
import { ButtonEventEmitter } from 'src/plugins/buzzer/ButtonEventEmitter';

export class Dongle extends ButtonEventEmitter implements IDongle {
  // Keep track of the total dongle count to give each dongle a unique name
  private static dongleCount = 0;

  name: string;
  controllers: IController[];

  constructor(public device: IDevice) {
    super();

    this.name = `Dongle ${++Dongle.dongleCount}`;
    this.controllers = Array.from({ length: device.controllers }, (_, i) => {
      const lightApi: LightApi = {
        updateLight: this.updateControllerLight(i),
      };

      return new Controller(
        lightApi,
        `Controller ${Dongle.dongleCount}-${i + 1}`,
      );
    });

    // Listen for device updates
    device.buttonUpdateHandler = this.onButtonUpdate.bind(this);
  }

  async reset(): Promise<void> {
    this.device.reset();
  }

  private onButtonUpdate(states: ButtonState[]): void {
    const changedStates = states
      .filter((state) => !this.controllers[state.controller].disabled)
      .filter(
        (state) =>
          // Compare new state with current state. Only accept updates.
          this.controllers[state.controller].buttons[state.button] !==
          state.pressed,
      );

    // Update all controllers and fire events
    changedStates.forEach((state) => {
      const controller = this.controllers[state.controller];
      controller.update(state);

      // Emit changes to all listeners
      const event = {
        button: state.button,
        controller,
      };

      this.emit('change', event);
      this.emit(state.pressed ? 'press' : 'release', event);
    });
  }

  private updateControllerLight(controllerIndex: number) {
    return async (value: boolean) => {
      return this.device.updateLight(controllerIndex, value);
    };
  }
}
