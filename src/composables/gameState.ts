import { computed, onBeforeMount, onUnmounted, Ref, watch } from 'vue';
import { GameState } from 'app/common/GameState';
import { useGameStore } from 'stores/game-store';

export function useGameState<S extends GameState>(initialState: S) {
  const gameStore = useGameStore();

  onBeforeMount(() => {
    gameStore.transition(initialState);
  });

  onUnmounted(() => {
    gameStore.reset();
  });

  const gameState = computed<S>(() => {
    // When no state is given, return the initial state
    if (
      gameStore.state === undefined ||
      gameStore.state?.game !== initialState.game
    ) {
      return initialState;
    }

    return gameStore.state as S;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createEvent = <Args extends any[]>(
    transitionRules: ((...args: Args) => boolean)[],
  ) => {
    return (...args: Args) => {
      for (const rule of transitionRules) {
        const match = rule(...args);
        if (match) {
          break;
        }
      }
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transition = <Name extends S['name'], Args extends any[]>(
    from: Name | Name[],
    to: (state: Extract<S, { name: Name }>, ...args: Args) => S | undefined,
  ): ((...args: Args) => boolean) => {
    const states = Array.isArray(from) ? from : [from];
    return (...args: Args): boolean => {
      if (!states.includes(gameState.value.name as Name)) {
        return false;
      }
      const next = to(gameState.value as Extract<S, { name: Name }>, ...args);
      if (next === undefined) {
        return false;
      }
      gameStore.transition(next);
      return true;
    };
  };

  return {
    gameState,
    transition,
    createEvent,
  };
}

export function useStateActions<S extends GameState>(state: Ref<S>) {
  type StateName = S['name'];
  type ActionHandler = (state: S) => void;
  type StateActionHandlers = Partial<Record<StateName, ActionHandler>>;

  const entryActions: StateActionHandlers = {};
  const exitActions: StateActionHandlers = {};
  const doActions: StateActionHandlers = {};

  const onStateEntry = <K extends StateName>(
    name: K,
    fn: (state: Extract<S, { name: K }>) => void,
  ) => {
    entryActions[name] = fn as (s: S) => void;
  };

  const onStateExit = <K extends StateName>(
    name: K,
    fn: (state: Extract<S, { name: K }>) => void,
  ) => {
    exitActions[name] = fn as (s: S) => void;
  };

  const onStateDo = <K extends StateName>(
    name: K,
    fn: (state: Extract<S, { name: K }>) => void,
  ) => {
    doActions[name] = fn as (s: S) => void;
  };

  watch(state, (state, prevState) => {
    if (state.name === prevState.name) {
      callActionHandler(doActions, state);
    } else {
      callActionHandler(exitActions, prevState);
      callActionHandler(entryActions, state);
    }
  });

  const callActionHandler = (handlers: StateActionHandlers, state: S) => {
    const handler = handlers[state.name as StateName];
    if (handler) {
      handler(state);
    }
  };

  return {
    onStateEntry,
    onStateExit,
    onStateDo,
  };
}
