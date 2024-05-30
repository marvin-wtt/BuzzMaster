export type BuzzerState =
  | BuzzerPreparationState
  | BuzzerRunningState
  | BuzzerAnsweringState
  | BuzzerAnsweredState;

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
}

export interface BuzzerAnsweredState extends BuzzerStateBase {
  name: 'answered';
  pressedControllers: string[];
  controller: string;
  correct: boolean;
  points: number;
}
