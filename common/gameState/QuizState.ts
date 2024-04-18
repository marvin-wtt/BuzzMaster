import { BuzzerButton } from 'src/plugins/buzzer/types';

export type QuizState =
  | QuizPreparationState
  | QuizRunningState
  | QuizCompleteState;

export interface QuizStateBase {
  game: 'quiz';
}

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
