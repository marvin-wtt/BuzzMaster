export type BuzzerState =
  | BuzzerPreparationState
  | BuzzerRunningState
  | BuzzerAnsweringState;

export interface BuzzerStateBase {
  game: 'buzzer';
}

export interface BuzzerPreparationState extends BuzzerStateBase {
  name: 'preparing';
}

export interface BuzzerRunningState extends BuzzerStateBase {
  name: 'running';
  pressedControllers: string[];
}

export interface BuzzerAnsweringState extends BuzzerStateBase {
  name: 'answering';
  pressedControllers: string[];
  controller: string;
  time: number;
  correct?: boolean;
  points?: number;
}
