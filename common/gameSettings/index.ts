import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { StopwatchSettings } from 'app/common/gameSettings/StopwatchSettings';

export interface GameSettings {
  buzzer: BuzzerSettings;
  quiz: QuizSettings;
  stopwatch: StopwatchSettings;
}
