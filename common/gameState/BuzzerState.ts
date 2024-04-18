import { IController } from 'src/plugins/buzzer/types';

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
  disabledControllerIds: string[];
}

// TODO remove IController reference
export interface BuzzerAnsweringState extends BuzzerStateBase {
  name: 'answering';
  disabledControllerIds: string[];
  controller: IController;
  time: number;
  correct?: boolean;
  points?: number;
}
