import { Ref } from 'vue';

export interface BuzzerApi {
  dongles: Ref<Dongle[]>;
  reset: () => void;
  ready: Ref<boolean>;
  onButtonChange: (listener: (event: ButtonEvent) => void) => void;
  onButtonPressed: (listener: (event: ButtonPressEvent) => void) => void;
  onButtonReleaseListener: (
    listener: (event: ButtonReleaseEvent) => void
  ) => void;
  removeListener: (
    type: 'press' | 'release' | 'change',
    listener: ButtonEventListener
  ) => void;
}

export type Dongle = {
  name: string;
  device: HIDDevice;
  controllers: IController[];
  reset: () => void;
};

export type IController = {
  id: string;
  name: string;
  disabled: boolean;
  setLight: (value: boolean) => Promise<void>;
  buttons: Record<BuzzerButton, boolean>;
  update: (value: ButtonState) => boolean;
};

export type ButtonMapping = {
  controller: number;
  button: BuzzerButton;
  byte: number;
  mask: number;
};

export enum BuzzerButton {
  RED = 0,
  BLUE = 1,
  ORANGE = 2,
  GREEN = 3,
  YELLOW = 4,
}

export type ButtonState = {
  controller: number;
  button: BuzzerButton;
  pressed: boolean;
};

export type ButtonChangeEventListener = (event: ButtonEvent) => void;
export type ButtonPressEventListener = (event: ButtonPressEvent) => void;
export type ButtonReleaseEventListener = (event: ButtonReleaseEvent) => void;
export type ButtonEventListener =
  | ButtonChangeEventListener
  | ButtonPressEventListener
  | ButtonReleaseEventListener;

export type ButtonEvent = ButtonPressEvent | ButtonReleaseEvent;

export type ButtonPressEvent = {
  type: 'press';
  button: BuzzerButton;
  controller: IController;
};

export type ButtonReleaseEvent = {
  type: 'release';
  button: BuzzerButton;
  controller: IController;
};
