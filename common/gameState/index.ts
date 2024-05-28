import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { QuizState } from 'app/common/gameState/QuizState';
import { StopwatchState } from 'app/common/gameState/StopwatchState';
import { LeaderboardState } from 'app/common/gameState/LeaderboardState';

export type GameState =
  | BuzzerState
  | QuizState
  | StopwatchState
  | LeaderboardState;
