import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import type { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import type { StopwatchSettings } from 'app/common/gameSettings/StopwatchSettings';
import type { GameSettings } from 'app/common/gameSettings';
import type { ViewingRateSettings } from 'app/common/gameSettings/ViewingRateSettings';
import type { PongSettings } from 'app/common/gameSettings/PongSettings';

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

  const viewingRateSettings = ref<ViewingRateSettings>({
    startViewing: false,
    readyCheck: true,
  });

  const pongSettings = ref<PongSettings>({
    rounds: 7,
    speed: 'normal',
    pointsForWin: 1,
  });

  const gameSettings = computed<GameSettings>(() => ({
    buzzer: buzzerSettings.value,
    quiz: quizSettings.value,
    stopwatch: stopwatchSettings.value,
    viewingRate: viewingRateSettings.value,
    pong: pongSettings.value,
  }));

  return {
    gameSettings,

    buzzerSettings,
    quizSettings,
    stopwatchSettings,
    viewingRateSettings,
    pongSettings,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useGameSettingsStore, import.meta.hot),
  );
}
