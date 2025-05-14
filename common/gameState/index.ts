import type { BuzzerState } from 'app/common/gameState/BuzzerState';
import type { QuizState } from 'app/common/gameState/QuizState';
import type { StopwatchState } from 'app/common/gameState/StopwatchState';
import type { LeaderboardState } from 'app/common/gameState/LeaderboardState';
import type { ViewingRateState } from 'app/common/gameState/ViewingRateState';

export type GameState =
  | BuzzerState
  | QuizState
  | StopwatchState
  | LeaderboardState
  | ViewingRateState;
