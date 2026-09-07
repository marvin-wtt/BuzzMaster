import type { BuzzerState } from '@/../common/gameState/BuzzerState';
import type { QuizState } from '@/../common/gameState/QuizState';
import type { StopwatchState } from '@/../common/gameState/StopwatchState';
import type { LeaderboardState } from '@/../common/gameState/LeaderboardState';
import type { ViewingRateState } from '@/../common/gameState/ViewingRateState';
import type { SimonState } from '@/../common/gameState/SimonState';
import type { PongState } from '@/../common/gameState/PongState';

export type GameState =
  | BuzzerState
  | QuizState
  | StopwatchState
  | LeaderboardState
  | ViewingRateState
  | PongState
  | SimonState;
