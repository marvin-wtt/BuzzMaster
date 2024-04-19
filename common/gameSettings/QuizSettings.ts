import { BuzzerButton } from 'src/plugins/buzzer/types';

export interface QuizSettings {
  activeButtons: BuzzerButton[];
  answerTime: number;
  changeMode: 'never' | 'always' | 'confirm';
  playSounds: boolean;
  countDownBeepStartAt: number;
  resultMode: 'table' | 'bar';
  pointsCorrect: number;
  pointsWrong: number;
}
