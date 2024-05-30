export type StopwatchState =
  | StopwatchPreparationState
  | StopwatchRunningState
  | StopwatchPausedState
  | StopwatchCompletedState;

export interface StopwatchStateBase {
  game: 'stopwatch';
}

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
  result: Record<string, number | null>;
  points?: Record<string, number | undefined>;
}
