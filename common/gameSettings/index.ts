import type { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import type { StopwatchSettings } from 'app/common/gameSettings/StopwatchSettings';
import type { PongSettings } from 'app/common/gameSettings/PongSettings';

export interface GameSettings {
  buzzer: BuzzerSettings;
  quiz: QuizSettings;
  stopwatch: StopwatchSettings;
  pong: PongSettings;
}
