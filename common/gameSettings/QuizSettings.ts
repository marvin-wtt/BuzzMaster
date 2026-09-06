import type { BuzzerButton } from 'src/plugins/buzzer/types';
import type { QuizMode } from 'app/common/gameState/QuizState';

export interface QuizSettings {
  activeButtons: BuzzerButton[];
  answerTime: number;
  changeMode: 'never' | 'always' | 'confirm';
  playSounds: boolean;
  countDownBeepStartAt: number;
  mode: QuizMode;
  presentationView: 'table' | 'bar-chart';
  pointsCorrect: number;
  pointsWrong: number;
  /** Fixed amount of points awarded exclusively to the fastest correct player in 'fastest-bonus' mode (replacing standard correct points). */
  pointsFastestBonus: number;
  /** Determines if player names and reaction times are shown on the cast presentation screen during the Quiz results. */
  castShowControllers: boolean;
}
