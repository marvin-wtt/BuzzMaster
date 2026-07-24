import type { BuzzerButton } from '@/plugins/buzzer/types';
import type { QuizMode } from '@/../common/gameState/QuizState';

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
