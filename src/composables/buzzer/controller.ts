import {
  ButtonState,
  BuzzerButton,
  IController,
} from 'src/composables/buzzer/types';
import {reactive} from "vue";

export const Controller = (name: string): Omit<IController, 'setLight'> => {
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
    name,
    buttons,
    disabled,
    update,
  };
};
