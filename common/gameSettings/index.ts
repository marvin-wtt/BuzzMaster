import type { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import type { SimonSettings } from 'app/common/gameSettings/SimonSettings';
import type { StopwatchSettings } from 'app/common/gameSettings/StopwatchSettings';

export interface GameSettings {
  buzzer: BuzzerSettings;
  quiz: QuizSettings;
  simon: SimonSettings;
  stopwatch: StopwatchSettings;
}
