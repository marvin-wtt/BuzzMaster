export type ViewingRateState =
  | ViewingRatePreparingState
  | ViewingRateRunningState
  | ViewingRateCompletedState
  | ViewingRatePausedState;

interface ViewingRateBase {
  game: 'viewing-rates';
}

export interface ViewingRatePreparingState extends ViewingRateBase {
  name: 'preparing';
}

export interface ViewingRateRunningState extends ViewingRateBase {
  name: 'running';
  time: number;
  changeTimes: Record<string, number[]>;
}

export interface ViewingRatePausedState extends ViewingRateBase {
  name: 'paused';
  time: number;
  changeTimes: Record<string, number[]>;
}

export interface ViewingRateCompletedState extends ViewingRateBase {
  name: 'completed';
  time: number;
  changeTimes: Record<string, number[]>;
}
