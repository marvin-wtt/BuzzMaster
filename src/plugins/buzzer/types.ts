import { Ref } from 'vue';

export interface BuzzerApi {
  dongles: Ref<Dongle[]>;
  reset: () => void;
  ready: Ref<boolean>;
  onButtonChange: (listener: ButtonEventListener) => void;
  onButtonPressed: (listener: ButtonPressedEventListener) => void;
  onButtonReleaseListener: (listener: ButtonReleasedEventListener) => void;
  removeListener: (
    type: 'pressed' | 'released' | 'change',
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

export type ButtonEventListener = <T extends ButtonEvent>(
  event: T | ButtonEvent
) => void;
export type ButtonPressedEventListener = (event: ButtonPressedEvent) => void;
export type ButtonReleasedEventListener = (event: ButtonReleasedEvent) => void;

export interface ButtonEvent {
  type: 'pressed' | 'released';
  button: BuzzerButton;
  controller: IController;
}

export interface ButtonPressedEvent extends ButtonEvent {
  type: 'pressed';
}

export interface ButtonReleasedEvent extends ButtonEvent {
  type: 'released';
}
