import type { Router } from 'vue-router';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';
import { isPresetGame } from '@/../common/gamePreset/GamePreset';
import { useGameStore } from '@/stores/game-store';
import { useGameSettingsStore } from '@/stores/game-settings-store';

export type ActivationResult =
  { success: true } | { success: false; error: string };

/** Route name per game. Kept beside the preset union so the two stay in step. */
const ROUTE_BY_GAME = {
  buzzer: 'buzzer-game',
  quiz: 'quiz-game',
  simon: 'simon-game',
  stopwatch: 'stopwatch-game',
  pong: 'pong-game',
} as const;

/**
 * Apply a preset and open the matching game (plan section 16).
 *
 * Deliberately application-level rather than per-game: no game page should learn
 * about PowerPoint. This is equally usable by a future keyboard shortcut, a
 * saved-setup feature, or the VSTO bridge section 40 contemplates, and it keeps
 * the integration away from routing internals.
 *
 * It configures the game and navigates to it. It does **not** start play — see
 * section 14. Someone clicking through slides must not be able to start a timed
 * round, and the operator stays in control of the game itself.
 */
export async function activateGamePreset(
  preset: GamePreset,
  router: Router,
): Promise<ActivationResult> {
  if (!isPresetGame(preset.game)) {
    return {
      success: false,
      error: `Unsupported game: ${String(preset.game)}`,
    };
  }

  const routeName = ROUTE_BY_GAME[preset.game];

  if (!router.hasRoute(routeName)) {
    return { success: false, error: `No route for game: ${preset.game}` };
  }

  const gameStore = useGameStore();
  const gameSettingsStore = useGameSettingsStore();

  try {
    // Reset first. `game-store` throws on a transition between different games
    // (game-store.ts), so activating a new game while another is running has to
    // clear the old state before anything else touches it.
    gameStore.reset();

    applySettings(gameSettingsStore, preset);

    await router.push({ name: routeName });

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

type SettingsStore = ReturnType<typeof useGameSettingsStore>;

/**
 * Copy preset settings into the live settings store.
 *
 * Spread rather than assign, so the preset object stored in a PowerPoint
 * document never becomes aliased by the running game's reactive state — editing
 * settings in BuzzMaster must not silently rewrite the deck.
 */
function applySettings(store: SettingsStore, preset: GamePreset): void {
  switch (preset.game) {
    case 'buzzer':
      store.buzzerSettings = { ...preset.settings };
      break;
    case 'quiz':
      store.quizSettings = {
        ...preset.settings,
        activeButtons: [...preset.settings.activeButtons],
      };
      break;
    case 'simon':
      store.simonSettings = { ...preset.settings };
      break;
    case 'stopwatch':
      store.stopwatchSettings = { ...preset.settings };
      break;
    case 'pong':
      store.pongSettings = { ...preset.settings };
      break;
  }
}
