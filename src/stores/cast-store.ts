import { acceptHMRUpdate, defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { GameState } from 'app/common/gameState';
import { useRouter } from 'vue-router';

export const useCastStore = defineStore('cast', () => {
  const { locale } = useI18n();
  const router = useRouter();

  const gameState = ref<GameState>();
  async function updateGameState(state: GameState | undefined) {
    const changeRoute = gameState.value?.game !== state?.game;

    if (changeRoute) {
      // Always to via index page to avoid state conflicts
      await router.push({ name: 'cast' });
    }

    gameState.value = state;

    // Route to next page if needed
    if (!changeRoute || state === undefined) {
      return;
    }

    const routeName = `cast-${state.game}`;
    if (!router.hasRoute(routeName)) {
      return;
    }

    await router.push({ name: routeName });
  }

  const controllers = ref<Record<string, string>>({});
  function updateControllers(value: Record<string, string>) {
    controllers.value = value;
  }

  function updateLocale(value: string) {
    locale.value = value;
  }

  return {
    controllers,
    gameState,

    updateGameState,
    updateLocale,
    updateControllers,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCastStore, import.meta.hot));
}
