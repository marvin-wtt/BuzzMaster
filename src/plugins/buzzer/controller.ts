import {
  ButtonState,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { reactive } from 'vue';

export const Controller = (name: string): Omit<IController, 'setLight'> => {
  const id = crypto.randomUUID();
  const disabled = false;
  const buttons: Record<BuzzerButton, boolean> = reactive({
    [BuzzerButton.RED]: false,
    [BuzzerButton.BLUE]: false,
    [BuzzerButton.ORANGE]: false,
    [BuzzerButton.GREEN]: false,
    [BuzzerButton.YELLOW]: false,
  });

  const update = (state: ButtonState): boolean => {
    const changed = buttons[state.button] !== state.pressed;
    buttons[state.button] = state.pressed;

    return changed;
  };

  return {
    id,
    name,
    buttons,
    disabled,
    update,
  };
};