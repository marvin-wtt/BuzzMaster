export type Dongle = {
  name: string;
  device: HIDDevice;
};

export type Controller = {
  name: string;
  buttons: Record<BuzzerButton, boolean>;
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
