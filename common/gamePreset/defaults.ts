import { BuzzerButton } from '@/plugins/buzzer/types';
import type { BuzzerSettings } from '@/../common/gameSettings/BuzzerSettings';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import type { SimonSettings } from '@/../common/gameSettings/SimonSettings';
import type { StopwatchSettings } from '@/../common/gameSettings/StopwatchSettings';
import type { ViewingRateSettings } from '@/../common/gameSettings/ViewingRateSettings';
import type { PongSettings } from '@/../common/gameSettings/PongSettings';
import type { GamePreset, PresetGame } from '@/../common/gamePreset/GamePreset';

/**
 * Default settings per game mode.
 *
 * Shared between `game-settings-store` (the desktop app's initial state) and
 * `GamePreset` creation (a newly configured PowerPoint element). Keeping one
 * copy means a PowerPoint preset and a freshly launched game start from exactly
 * the same place.
 */
export const DEFAULT_BUZZER_SETTINGS: BuzzerSettings = {
  answerTime: 10,
  multipleAttempts: false,
  playSounds: true,
  countDownBeepStartAt: 10,
  pointsCorrect: 0,
  pointsWrong: 0,
};

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
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
  showReactionTimes: false,
  pointsCorrect: 0,
  pointsWrong: 0,
  pointsFastestBonus: 0,
};

export const DEFAULT_SIMON_SETTINGS: SimonSettings = {
  answerTime: 1,
  showingSpeed: 1,
  autoNextRound: false,
  lastManStanding: false,
  winnerPoints: 0,
};

export const DEFAULT_STOPWATCH_SETTINGS: StopwatchSettings = {
  playSounds: true,
};

export const DEFAULT_VIEWING_RATE_SETTINGS: ViewingRateSettings = {
  startViewing: false,
  readyCheck: true,
};

export const DEFAULT_PONG_SETTINGS: PongSettings = {
  rounds: 7,
  speed: 'normal',
  pointsForWin: 1,
};

/**
 * Build a complete preset for a game using its defaults.
 *
 * Returns a fresh deep-ish copy each call: a preset is persisted into a document
 * and edited independently per element, so sharing the default objects between
 * elements would let one element's edits leak into another's.
 */
export function defaultPresetFor(game: PresetGame): GamePreset {
  switch (game) {
    case 'buzzer':
      return { game, settings: { ...DEFAULT_BUZZER_SETTINGS } };
    case 'quiz':
      return {
        game,
        settings: {
          ...DEFAULT_QUIZ_SETTINGS,
          activeButtons: [...DEFAULT_QUIZ_SETTINGS.activeButtons],
        },
      };
    case 'simon':
      return { game, settings: { ...DEFAULT_SIMON_SETTINGS } };
    case 'stopwatch':
      return { game, settings: { ...DEFAULT_STOPWATCH_SETTINGS } };
    case 'pong':
      return { game, settings: { ...DEFAULT_PONG_SETTINGS } };
  }
}
