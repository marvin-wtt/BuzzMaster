import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';

interface BuzzerSettings {
  answerTime: number;
  multipleAttempts: boolean;
  playSounds: boolean;
  countDownBeepStartAt: number;
}

interface QuizSettings {
  activeButtons: BuzzerButton[];
  answerTime: number;
  changeMode: 'never' | 'always' | 'confirm';
  playSounds: boolean;
  countDownBeepStartAt: number;
  resultMode: 'table' | 'bar';
}

export const useQuestionSettingsStore = defineStore('questionSettings', () => {
  const defaultBuzzerSettings: BuzzerSettings = {
    answerTime: 10,
    multipleAttempts: false,
    playSounds: true,
    countDownBeepStartAt: 10,
  };

  const defaultQuizSettings: QuizSettings = {
    activeButtons: [
      BuzzerButton.BLUE,
      BuzzerButton.ORANGE,
      BuzzerButton.GREEN,
      BuzzerButton.YELLOW,
    ],
    answerTime: 30,
    changeMode: 'never',
    playSounds: true,
    countDownBeepStartAt: 10,
    resultMode: 'table',
  };

  const buzzerSettings = reactive<BuzzerSettings>({
    ...defaultBuzzerSettings,
  });

  const quizSettings = reactive<QuizSettings>({
    ...defaultQuizSettings,
  });

  return {
    buzzerSettings,
    quizSettings,
  };
});
