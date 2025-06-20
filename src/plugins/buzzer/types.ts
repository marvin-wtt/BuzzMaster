import type TypedEmitter from 'typed-emitter';

export type IBuzzerApi = IButtonEventEmitter & {
  dongles: IDongle[];
  disconnectedDongles: IDongle[];
  reset: () => Promise<void>;
  addDevice: (device: IDevice) => Promise<void>;
  removeDevice: (deviceId: string) => void;
  restoreDongle: (originalDongle: IDongle, newDongle: IDongle) => void;
};

export type IBuzzerPlugin = (api: IBuzzerApi) => Promise<void> | void;

export type LightApi = {
  updateLight: (value: boolean) => Promise<void>;
};

export type IDevice = {
  readonly id: string;
  readonly controllers: number;
  readonly energySavingDelay: number | undefined;
  prepare: () => Promise<void> | void;
  updateLight: (controller: number, value: boolean) => Promise<void> | void;
  buttonUpdateHandler: (states: ButtonState[]) => void;
  reset: () => Promise<void> | void;
  close: () => Promise<void> | void;
};

export type IDongle = IButtonEventEmitter & {
  name: string;
  device: IDevice;
  controllers: IController[];
  reset: () => Promise<void> | void;
  find: () => void;
};

export type IController = {
  id: string;
  name: string;
  disabled: boolean;
  energySavingAt: number | undefined;
  setLight: (value: boolean) => void;
  buttons: Record<BuzzerButton, boolean>;
  update: (value: ButtonState) => void;
  find: () => void;
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

export type IButtonEventEmitter = TypedEmitter<{
  change: (event: ButtonEvent) => void;
  press: (event: ButtonEvent) => void;
  release: (event: ButtonEvent) => void;
}>;

export type ButtonEvent = {
  button: BuzzerButton;
  controller: IController;
};
