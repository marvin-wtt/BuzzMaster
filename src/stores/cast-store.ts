import { acceptHMRUpdate, defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';
import type { CastSnapshot } from '@/../common/CastSnapshot';

/**
 * Cast state, shared by every surface that renders it.
 *
 * Deliberately holds no transport and no navigation. It used to push router
 * routes on game change, which made it unusable anywhere but the cast window —
 * the PowerPoint add-in would have been navigated away from its own route, and
 * out of its Office context, on the first game change.
 *
 * Routing now lives in `CastLayout`, which is the surface that actually has
 * routes. Plan section 21: the transport, and the navigation, belong outside the
 * presentation layer.
 */
export const useCastStore = defineStore('cast', () => {
  const { locale } = useI18n();

  const gameState = ref<GameState>();
  function updateGameState(state: GameState | undefined) {
    gameState.value = state;
  }

  const gameSettings = ref<GameSettings>({} as GameSettings);
  function updateGameSettings(settings: GameSettings) {
    gameSettings.value = settings;
  }

  const controllers = ref<Record<string, string>>({});
  function updateControllers(value: Record<string, string>) {
    controllers.value = value;
  }

  function updateLocale(value: string) {
    locale.value = value;
  }

  /** Apply a complete snapshot at once, as a newly connected client receives. */
  function applySnapshot(snapshot: CastSnapshot) {
    if (snapshot.gameSettings) {
      updateGameSettings(snapshot.gameSettings);
    }
    updateControllers(snapshot.controllers);
    updateLocale(snapshot.locale);
    // Game state last: surfaces switch presentation on it, so everything else
    // should already be in place when it changes.
    updateGameState(snapshot.gameState);
  }

  return {
    controllers,
    gameState,
    gameSettings,

    updateGameState,
    updateGameSettings,
    updateLocale,
    updateControllers,
    applySnapshot,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCastStore, import.meta.hot));
}
