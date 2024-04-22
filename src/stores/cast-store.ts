import { acceptHMRUpdate, defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { GameState } from 'app/common/gameState';
import { useRouter } from 'vue-router';
import { CastMessage } from 'app/common/cast';

export const useCastStore = defineStore('cast', () => {
  const { locale } = useI18n();
  const router = useRouter();

  function receiveMessage(message: CastMessage) {
    // TODO Add game settings

    switch (message.name) {
      case 'game-state':
        updateGameState(message.data);
        break;
      case 'controllers':
        updateControllers(message.data);
        break;
      case 'locale':
        updateLocale(message.data);
        break;
    }
  }

  const gameState = ref<GameState>();
  function updateGameState(state: GameState | undefined) {
    if (gameState.value?.game !== state?.game) {
      let routeName = state === undefined ? undefined : `cast-${state.game}`;

      if (routeName === undefined || !router.hasRoute(routeName)) {
        routeName = 'cast';
      }

      router.push(routeName);
    }

    gameState.value = state;
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

    receiveMessage,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCastStore, import.meta.hot));
}
