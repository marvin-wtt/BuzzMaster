import { BuzzerButton, IController } from 'src/plugins/buzzer/types';

export type GameState = BuzzerState | QuizState | StopwatchState;

export interface StopwatchStateBase {
  game: 'stopwatch';
}

export type StopwatchState =
  | StopwatchPreparationState
  | StopwatchRunningState
  | StopwatchPausedState
  | StopwatchCompletedState;

export interface StopwatchPreparationState extends StopwatchStateBase {
  name: 'preparing';
}

export interface StopwatchRunningState extends StopwatchStateBase {
  name: 'running';
  time: number;
  result: Record<string, number>;
}

export type StopwatchPausedState = {
  game: 'stopwatch';
  name: 'paused';
  time: number;
  result: Record<string, number>;
};

export interface StopwatchCompletedState extends StopwatchStateBase {
  name: 'completed';
  time: number;
  result: Record<string, number | undefined>;
}

export interface BuzzerStateBase {
  game: 'buzzer';
}

export type BuzzerState =
  | BuzzerPreparationState
  | BuzzerRunningState
  | BuzzerAnsweringState;

export interface BuzzerPreparationState extends BuzzerStateBase {
  name: 'preparing';
}

export interface BuzzerRunningState extends BuzzerStateBase {
  name: 'running';
  disabledControllerIds: string[];
}

export interface BuzzerAnsweringState extends BuzzerStateBase {
  name: 'answering';
  disabledControllerIds: string[];
  controller: IController;
  time: number;
  correct?: boolean;
  points?: number;
}

export interface QuizStateBase {
  game: 'quiz';
}

export type QuizState =
  | QuizPreparationState
  | QuizRunningState
  | QuizCompleteState;

export interface QuizPreparationState extends QuizStateBase {
  name: 'preparing';
}

export interface QuizRunningStateBase extends QuizStateBase {
  name: 'running';
  time: number;
}

export type QuizRunningState =
  | QuizRunningChangeAlwaysState
  | QuizRunningChangeNeverState
  | QuizRunningChangeConfirmState;

export interface QuizRunningChangeAlwaysState extends QuizRunningStateBase {
  answerChangeAllowed: 'always';
  result: Record<string, BuzzerButton>;
}

export interface QuizRunningChangeNeverState extends QuizRunningStateBase {
  answerChangeAllowed: 'never';
  result: Record<string, BuzzerButton>;
}

export interface QuizRunningChangeConfirmState extends QuizRunningStateBase {
  answerChangeAllowed: 'confirm';
  unconfirmed: Record<string, BuzzerButton>;
  result: Record<string, BuzzerButton>;
}

export interface QuizCompleteState extends QuizStateBase {
  name: 'completed';
  result: Record<string, BuzzerButton>;
  correct?: BuzzerButton[];
  points?: Record<string, number>;
}
