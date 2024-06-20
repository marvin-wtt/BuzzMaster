import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { StopwatchSettings } from 'app/common/gameSettings/StopwatchSettings';
import { GameSettings } from 'app/common/gameSettings';

export const useGameSettingsStore = defineStore('gameSettings', () => {
  const buzzerSettings = ref<BuzzerSettings>({
    answerTime: 10,
    multipleAttempts: false,
    playSounds: true,
    countDownBeepStartAt: 10,
    pointsCorrect: 0,
    pointsWrong: 0,
  });

  const quizSettings = ref<QuizSettings>({
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
    mode: 'normal',
    presentationView: 'bar-chart',
    pointsCorrect: 0,
    pointsWrong: 0,
  });

  const stopwatchSettings = ref<StopwatchSettings>({
    playSounds: true,
  });

  const gameSettings = computed<GameSettings>(() => ({
    buzzer: buzzerSettings.value,
    quiz: quizSettings.value,
    stopwatch: stopwatchSettings.value,
  }));

  return {
    gameSettings,

    buzzerSettings,
    quizSettings,
    stopwatchSettings,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useGameSettingsStore, import.meta.hot),
  );
}
