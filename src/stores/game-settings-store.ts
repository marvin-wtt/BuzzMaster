import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { BuzzerSettings } from '@/../common/gameSettings/BuzzerSettings';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import type { SimonSettings } from '@/../common/gameSettings/SimonSettings';
import type { StopwatchSettings } from '@/../common/gameSettings/StopwatchSettings';
import type { GameSettings } from '@/../common/gameSettings';
import type { ViewingRateSettings } from '@/../common/gameSettings/ViewingRateSettings';
import type { PongSettings } from '@/../common/gameSettings/PongSettings';
import {
  DEFAULT_BUZZER_SETTINGS,
  DEFAULT_QUIZ_SETTINGS,
  DEFAULT_SIMON_SETTINGS,
  DEFAULT_STOPWATCH_SETTINGS,
  DEFAULT_VIEWING_RATE_SETTINGS,
  DEFAULT_PONG_SETTINGS,
} from '@/../common/gamePreset/defaults';

export const useGameSettingsStore = defineStore('gameSettings', () => {
  const buzzerSettings = ref<BuzzerSettings>({ ...DEFAULT_BUZZER_SETTINGS });

  const quizSettings = ref<QuizSettings>({
    ...DEFAULT_QUIZ_SETTINGS,
    activeButtons: [...DEFAULT_QUIZ_SETTINGS.activeButtons],
  });

  const simonSettings = ref<SimonSettings>({ ...DEFAULT_SIMON_SETTINGS });

  const stopwatchSettings = ref<StopwatchSettings>({
    ...DEFAULT_STOPWATCH_SETTINGS,
  });

  const viewingRateSettings = ref<ViewingRateSettings>({
    ...DEFAULT_VIEWING_RATE_SETTINGS,
  });

  const pongSettings = ref<PongSettings>({ ...DEFAULT_PONG_SETTINGS });

  const gameSettings = computed<GameSettings>(() => ({
    buzzer: buzzerSettings.value,
    quiz: quizSettings.value,
    simon: simonSettings.value,
    stopwatch: stopwatchSettings.value,
    viewingRate: viewingRateSettings.value,
    pong: pongSettings.value,
  }));

  return {
    gameSettings,

    buzzerSettings,
    quizSettings,
    simonSettings,
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
