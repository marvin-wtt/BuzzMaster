import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';
import type { GameState } from 'app/common/gameState';

class StateTransitionError extends Error {
  constructor(state: GameState, prevState: GameState) {
    super(`Invalid transition from ${prevState.game} to ${state.game}`);
  }
}

export const useGameStore = defineStore('game-store', () => {
  const state = ref<GameState>();

  function transition(gameState: GameState) {
    if (state.value !== undefined && state.value?.game !== gameState.game) {
      const prevState = state.value;
      // This should be an illegal transition.
      // Transitions between games should always be after a reset.
      // Reset it manually to allow state triggers to take action.
      state.value = undefined;

      throw new StateTransitionError(prevState, gameState);
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
