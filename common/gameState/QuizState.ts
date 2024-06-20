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

export type QuizMode = 'normal' | 'survey' | 'elimination';

export interface QuizRunningStateBase extends QuizStateBase {
  name: 'running';
  mode: QuizMode;
  time: number;
  controllers: string[];
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
  mode: QuizMode;
  controllers: string[];
  result: Record<string, BuzzerButton>;
  correct?: BuzzerButton[];
}
