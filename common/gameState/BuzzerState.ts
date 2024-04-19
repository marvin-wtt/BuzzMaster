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
  disabledControllers: string[];
}

export interface BuzzerAnsweringState extends BuzzerStateBase {
  name: 'answering';
  disabledControllers: string[];
  controller: string;
  time: number;
  correct?: boolean;
  points?: number;
}
