export type Dongle = {
  name: string;
  device: HIDDevice;
  controllers: IController[];
  reset: () => void;
};

export type IController = {
  name: string;
  setLight: (value: boolean) => Promise<void>;
  buttons: Record<BuzzerButton, boolean>;
  update: (value: ButtonState) => boolean;
}

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

export type ButtonEventHandler = (event: ButtonEvent) => void;

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
