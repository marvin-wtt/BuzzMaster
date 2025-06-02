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
}
