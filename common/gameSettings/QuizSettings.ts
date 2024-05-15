import { BuzzerButton } from 'src/plugins/buzzer/types';

export interface QuizSettings {
  activeButtons: BuzzerButton[];
  answerTime: number;
  changeMode: 'never' | 'always' | 'confirm';
  playSounds: boolean;
  countDownBeepStartAt: number;
  mode: 'quiz' | 'survey';
  presentationView: 'table' | 'bar-chart';
  pointsCorrect: number;
  pointsWrong: number;
}
