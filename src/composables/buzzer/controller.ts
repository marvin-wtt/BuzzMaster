import {
  ButtonState,
  BuzzerButton,
  IController,
} from 'src/composables/buzzer/types';

export const Controller = (name: string): Omit<IController, 'setLight'> => {
  const buttons: Record<BuzzerButton, boolean> = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
  };

  const update = (state: ButtonState): boolean => {
    const changed = buttons[state.button] !== state.pressed;
    buttons[state.button] = state.pressed;

    return changed;
  };

  return {
    name,
    buttons,
    update,
  };
};
