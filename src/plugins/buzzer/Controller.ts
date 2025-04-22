import {
  type ButtonState,
  BuzzerButton,
  type IController,
  type LightApi,
} from 'src/plugins/buzzer/types';
import { reactive } from 'vue';

export class Controller implements IController {
  readonly id = crypto.randomUUID();
  readonly buttons: Record<BuzzerButton, boolean> = reactive({
    [BuzzerButton.RED]: false,
    [BuzzerButton.BLUE]: false,
    [BuzzerButton.ORANGE]: false,
    [BuzzerButton.GREEN]: false,
    [BuzzerButton.YELLOW]: false,
  });
  disabled = false;
  energySavingAt: number | undefined = undefined;

  constructor(
    private lightApi: LightApi,
    public name: string,
    private energySavingDelay: number | undefined,
  ) {}

  update(state: ButtonState): void {
    this.energySavingAt =
      this.energySavingDelay !== undefined
        ? new Date().getTime() + this.energySavingDelay
        : undefined;

    this.buttons[state.button] = state.pressed;
  }

  async setLight(value: boolean): Promise<void> {
    return this.lightApi.updateLight(value);
  }
}
