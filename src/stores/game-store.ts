import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';
import { GameState } from 'app/common/gameState';

export const useGameStore = defineStore('game-store', () => {
  const state = ref<GameState>();

  function transition(gameState: GameState) {
    if (state.value !== undefined && state.value?.name !== gameState.name) {
      // This should be an illegal transition.
      // Transitions between games should always be after a reset.
      // Reset it manually to allow state triggers to take action.
      state.value = undefined;
    }

    state.value = { ...gameState };
  }

  function reset() {
    state.value = undefined;
  }

  return {
    state,

    transition,
    reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
