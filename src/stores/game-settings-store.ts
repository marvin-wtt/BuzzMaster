import { acceptHMRUpdate, defineStore } from 'pinia';
import { reactive } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { StopwatchSettings } from 'app/common/gameSettings/StopwatchSettings';
import { GameSettings } from 'app/common/gameSettings';

export const useGameSettingsStore = defineStore('gameSettings', () => {
  const buzzerSettings = reactive<BuzzerSettings>({
    answerTime: 10,
    multipleAttempts: false,
    playSounds: true,
    countDownBeepStartAt: 10,
    pointsCorrect: 0,
    pointsWrong: 0,
  });

  const quizSettings = reactive<QuizSettings>({
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
    resultMode: 'bar',
    pointsCorrect: 0,
    pointsWrong: 0,
  });

  const stopwatchSettings = reactive<StopwatchSettings>({
    playSounds: true,
  });

  const gameSettings = reactive<GameSettings>({
    buzzer: buzzerSettings,
    quiz: quizSettings,
    stopwatch: stopwatchSettings,
  });

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
