import type {
  ButtonState,
  IController,
  IDevice,
  IDongle,
  LightApi,
} from 'src/plugins/buzzer/types';
import { Controller } from 'src/plugins/buzzer/Controller';
import { ButtonEventEmitter } from 'src/plugins/buzzer/ButtonEventEmitter';
import { FindCoordinator } from 'src/plugins/buzzer/utils/FindCoordinator';

export class Dongle extends ButtonEventEmitter implements IDongle {
  // Keep track of the total dongle count to give each dongle a unique name
  private static DONGLE_COUNT = 0;
  public static CONTROLLER_NAMES: string[] = [];

  name: string;
  controllers: IController[];

  constructor(public device: IDevice) {
    super();

    this.name = `Dongle ${++Dongle.DONGLE_COUNT}`;
    this.controllers = Array.from({ length: device.controllers }, (_, i) => {
      const lightApi: LightApi = {
        updateLight: this.updateControllerLight(i),
      };
      const controllerName = Dongle.controllerName(i);

      return new Controller(lightApi, controllerName, device.energySavingDelay);
    });

    // Listen for device updates
    device.buttonUpdateHandler = this.onButtonUpdate.bind(this);
  }

  static controllerName(controllerIndex: number): string {
    const name = Dongle.CONTROLLER_NAMES.pop();

    return name ?? `Controller ${Dongle.DONGLE_COUNT}-${controllerIndex + 1}`;
  }

  async reset(): Promise<void> {
    await this.device.reset();
  }

  private onButtonUpdate(states: ButtonState[]): void {
    const changedStates = states.filter(
      (state) =>
        // Compare new state with current state. Only accept updates.
        this.controllers[state.controller]!.buttons[state.button] !==
        state.pressed,
    );

    // Send changes to all updated controllers
    changedStates.forEach((state) => {
      this.controllers[state.controller]!.update(state);
    });

    // Emit changes to all listeners
    changedStates
      .filter((state) => !this.controllers[state.controller]!.disabled)
      .forEach((state) => {
        const event = {
          button: state.button,
          controller: this.controllers[state.controller]!,
        };

        this.emit('change', event);
        this.emit(state.pressed ? 'press' : 'release', event);
      });
  }

  find(): void {
    FindCoordinator.start(this.controllers);
  }

  private updateControllerLight(controllerIndex: number) {
    return async (value: boolean) => {
      return this.device.updateLight(controllerIndex, value);
    };
  }
}
