import { defineStore } from 'pinia';
import { reactive } from 'vue';

interface BuzzerSettings {
  answerTime: number;
  multipleAttempts: boolean;
  playSounds: boolean;
  countDownBeepStartAt: number;
}

export const useQuestionSettingsStore = defineStore('questionSettings', () => {
  const defaultBuzzerSettings: BuzzerSettings = {
    answerTime: 10,
    multipleAttempts: false,
    playSounds: true,
    countDownBeepStartAt: 10,
  };

  const buzzerSettings = reactive<BuzzerSettings>({
    ...defaultBuzzerSettings,
  });

  return {
    buzzerSettings,
  };
});
