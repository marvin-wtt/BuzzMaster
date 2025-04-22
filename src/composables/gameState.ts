import { computed, onBeforeMount, onUnmounted } from 'vue';
import type { GameState } from 'app/common/gameState';
import { useGameStore } from 'stores/game-store';

export function useGameState<S extends GameState>(initialState: S) {
  const gameStore = useGameStore();

  onBeforeMount(() => {
    gameStore.transition(initialState);
  });

  onUnmounted(() => {
    gameStore.reset();
  });

  const gameState = computed<Readonly<S>>(() => {
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

  const stateActions = useStateActions<S>();

  return {
    gameState,
    transition,
    createEvent,

    ...stateActions,
  };
}

export function useStateActions<S extends GameState>() {
  const gameStore = useGameStore();

  type StateName = S['name'];
  type ActionHandler = (state: S) => Promise<void> | void;
  type StateActionHandlers = Partial<Record<StateName, ActionHandler>>;

  const entryActions: StateActionHandlers = {};
  const exitActions: StateActionHandlers = {};
  const doActions: StateActionHandlers = {};

  const onStateEntry = <K extends StateName>(
    name: K,
    fn: (state: Extract<S, { name: K }>) => Promise<void> | void,
  ) => {
    entryActions[name] = fn as (s: S) => Promise<void> | void;
  };

  const onStateExit = <K extends StateName>(
    name: K,
    fn: (state: Extract<S, { name: K }>) => Promise<void> | void,
  ) => {
    exitActions[name] = fn as (s: S) => Promise<void> | void;
  };

  const onStateDo = <K extends StateName>(
    name: K,
    fn: (state: Extract<S, { name: K }>) => Promise<void> | void,
  ) => {
    doActions[name] = fn as (s: S) => Promise<void> | void;
  };

  const unsubscribe = gameStore.$onAction(
    ({
      name,
      store,
      args,
      after,
      //onError
    }) => {
      const prevState = store.state;
      const state = args[0];

      if (name === 'transition') {
        return after(() => {
          if (state?.name === prevState?.name) {
            if (state === undefined) {
              return;
            }
            return callActionHandler(doActions, state as S);
          }

          if (prevState !== undefined) {
            callActionHandler(exitActions, prevState as S);
          }

          if (state !== undefined) {
            callActionHandler(entryActions, state as S);
          }
        });
      }

      if (name === 'reset') {
        return after(() => {
          if (prevState !== undefined) {
            callActionHandler(exitActions, prevState as S);
          }
        });
      }
    },
  );

  onUnmounted(unsubscribe);

  const callActionHandler = (handlers: StateActionHandlers, state: S) => {
    const handler = handlers[state.name as StateName];
    if (handler) {
      const result = handler(state);
      if (result instanceof Promise) {
        result.catch(() => {
          console.error(
            `Error in state action handler for game ${state.game} in state ${state.name}:`,
          );
        });
      }
    }
  };

  return {
    onStateEntry,
    onStateExit,
    onStateDo,
  };
}
