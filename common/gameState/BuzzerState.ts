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
  ignoredControllers: string[];
}

export interface BuzzerAnsweringState extends BuzzerStateBase {
  name: 'answering';
  ignoredControllers: string[];
  controller: string;
  time: number;
  correct?: boolean;
  points?: number;
}
