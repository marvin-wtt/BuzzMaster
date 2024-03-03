import {
  ButtonState,
  BuzzerButton,
  IController,
  LightApi,
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

  constructor(
    private lightApi: LightApi,
    public name: string,
  ) {}

  update(state: ButtonState): void {
    this.buttons[state.button] = state.pressed;
  }

  async setLight(value: boolean): Promise<void> {
    return this.lightApi.updateLight(value);
  }
}
