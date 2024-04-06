import { BuzzerButton, IController } from 'src/plugins/buzzer/types';

export type GameState = BuzzerState | QuizState | StopwatchState;

export type StopwatchState =
  | StopwatchPreparationState
  | StopwatchRunningState
  | StopwatchDoneState;

export type StopwatchPreparationState = {
  game: 'stopwatch';
  name: 'preparing';
};

export type StopwatchRunningState = {
  game: 'stopwatch';
  name: 'running';
  time: number;
  pressedControllers: Map<IController, number>;
};

export type StopwatchDoneState = {
  game: 'stopwatch';
  name: 'completed';
  time: number;
  pressedControllers: Map<IController, number>;
};

export type BuzzerState =
  | BuzzerPreparationState
  | BuzzerRunningState
  | BuzzerAnsweringState;
export type BuzzerPreparationState = {
  game: 'buzzer';
  name: 'preparing';
};

export type BuzzerRunningState = {
  game: 'buzzer';
  name: 'running';
  disabledControllerIds: string[];
};

export type BuzzerAnsweringState = {
  game: 'buzzer';
  name: 'answering';
  disabledControllerIds: string[];
  controller: IController;
  time: number;
  correct?: boolean;
  points?: number;
};

export type QuizState =
  | QuizPreparationState
  | QuizRunningState
  | QuizCompleteState;

export type QuizPreparationState = {
  game: 'quiz';
  name: 'preparing';
};

export type QuizRunningState =
  | QuizRunningChangeAlwaysState
  | QuizRunningChangeNeverState
  | QuizRunningChangeConfirmState;

export type QuizRunningChangeAlwaysState = {
  game: 'quiz';
  name: 'running';
  time: number;
  answerChangeAllowed: 'always';
  result: Record<string, BuzzerButton>;
};

export type QuizRunningChangeNeverState = {
  game: 'quiz';
  name: 'running';
  time: number;
  answerChangeAllowed: 'never';
  result: Record<string, BuzzerButton>;
};

export type QuizRunningChangeConfirmState = {
  game: 'quiz';
  name: 'running';
  time: number;
  answerChangeAllowed: 'confirm';
  unconfirmed: Record<string, BuzzerButton>;
  result: Record<string, BuzzerButton>;
};

export type QuizCompleteState = {
  game: 'quiz';
  name: 'completed';
  result: Record<string, BuzzerButton>;
  correct?: BuzzerButton[];
  points?: Record<string, number>;
};
