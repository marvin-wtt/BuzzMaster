import type { BuzzerSettings } from '@/../common/gameSettings/BuzzerSettings';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import type { SimonSettings } from '@/../common/gameSettings/SimonSettings';
import type { StopwatchSettings } from '@/../common/gameSettings/StopwatchSettings';
import type { PongSettings } from '@/../common/gameSettings/PongSettings';

export interface GameSettings {
  buzzer: BuzzerSettings;
  quiz: QuizSettings;
  simon: SimonSettings;
  stopwatch: StopwatchSettings;
  pong: PongSettings;
}
