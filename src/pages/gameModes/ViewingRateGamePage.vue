<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column no-wrap">
      <!-- Content -->
      <div class="col-8 row justify-center">
        <div
          v-if="gameState.name === 'preparing'"
          class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center text-h5"
        >
          {{
            t('gameMode.stopwatch.controllersReady', {
              count: controllers.length,
            })
          }}
        </div>
        <div v-else>
          <div
            v-if="gameState.name !== 'completed'"
            class="text-h6 text-center"
          >
            <timer-animated :time="time" />

            <q-separator inset />
          </div>

          <div class="column justify-around full-height">
            <div
              v-if="gameState.name !== 'completed'"
              class="text-center"
            >
              <div class="text-h6">
                {{ t('gameMode.viewingRate.currentlyViewing') }}
              </div>

              <div class="text-h5">
                {{ currentlyViewingControllers }} / {{ totalControllers }} ({{
                  toRoundedPercentage(currentlyViewing)
                }})
              </div>
            </div>

            <div class="text-h6 text-center">
              <div class="text-h6">
                {{ t('gameMode.viewingRate.totalWatchRate') }}
              </div>

              <div class="text-h5">
                {{ toRoundedPercentage(totalWatchRate) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Actions -->
      <div class="col-4 column q-gutter-y-sm justify-center content-center">
        <template v-if="gameState.name === 'preparing'">
          <q-btn
            :label="t('gameMode.viewingRate.action.start')"
            color="primary"
            rounded
            data-testid="btn-game-start"
            @click="start()"
          />
        </template>
        <template v-else-if="gameState.name === 'running'">
          <q-btn
            :label="t('gameMode.viewingRate.action.pause')"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-pause"
            @click="pause()"
          />
          <safe-delete-btn
            :label="t('gameMode.viewingRate.action.complete')"
            class="self-center"
            color="primary"
            rounded
            data-testid="btn-game-complete"
            @click="stop()"
          />
        </template>
        <template v-else-if="gameState.name === 'paused'">
          <q-btn
            :label="t('gameMode.viewingRate.action.resume')"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-resume"
            @click="resume()"
          />
          <safe-delete-btn
            :label="t('gameMode.viewingRate.action.cancel')"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-cancel"
            @click="cancel()"
          />
        </template>
        <template v-else-if="gameState.name === 'completed'">
          <q-btn
            :label="t('gameMode.viewingRate.action.reset')"
            icon="replay"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-resume"
            @click="cancel()"
          />
        </template>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { storeToRefs } from 'pinia';
import { useBuzzer } from 'src/plugins/buzzer';
import { useTimer } from 'src/composables/timer';
import { useGameState } from 'src/composables/gameState';
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';
import {
  ViewingRateRunningState,
  ViewingRateState,
} from 'app/common/gameState/ViewingRateState';
import { ButtonEvent } from 'src/plugins/buzzer/types';
import TimerAnimated from 'components/TimerAnimated.vue';
import SafeDeleteBtn from 'components/SafeDeleteBtn.vue';

const { t } = useI18n();
const gameSettingsStore = useGameSettingsStore();
const {} = storeToRefs(gameSettingsStore);
const { controllers, buzzer } = useBuzzer();
const { time, stopTimer, startTimer } = useTimer({
  updateRate: 100,
  direction: 'up',
});
const { gameState, transition, onStateEntry, onStateExit } =
  useGameState<ViewingRateState>({
    game: 'viewing-rates',
    name: 'preparing',
  });

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});

const totalWatchRate = computed<number>(() => {
  if (gameState.value.name === 'preparing') {
    return 0;
  }

  return (
    Object.values(gameState.value.changeTimes)
      .map((changes) => controllerViewingRate(changes, time.value))
      .reduce((acc, viewingRate) => acc + viewingRate, 0) /
    Object.keys(gameState.value.changeTimes).length
  );
});

const currentlyViewingControllers = computed<number>(() => {
  if (gameState.value.name === 'preparing') {
    return 0;
  }

  const values = Object.values(gameState.value.changeTimes);

  return values.filter(controllerWatchStatus).length;
});

const totalControllers = computed<number>(() => {
  if (gameState.value.name === 'preparing') {
    return 0;
  }

  const values = Object.values(gameState.value.changeTimes);

  return values.length;
});

const currentlyViewing = computed<number>(() => {
  if (gameState.value.name === 'preparing') {
    return 0;
  }

  const values = Object.values(gameState.value.changeTimes);

  return values.filter(controllerWatchStatus).length / values.length;
});

const controllerViewingRate = (changes: number[], time: number) => {
  let totalWatchTime = 0;
  let watching = false;
  let prevTime = 0;
  for (const changeTime of changes) {
    if (watching) {
      totalWatchTime += changeTime - prevTime;
    }

    watching = !watching;
    prevTime = changeTime;
  }

  if (watching) {
    totalWatchTime += time - prevTime;
  }

  return totalWatchTime / time;
};

const tick = transition('running', (state, time: number) => {
  return {
    game: 'viewing-rates',
    name: 'running',
    time,
    changeTimes: state.changeTimes,
  };
});
watch(time, tick);

onStateEntry('running', () => {
  startTimer();
});

onStateExit('running', () => {
  stopTimer();
});

onStateEntry('preparing', () => {
  time.value = 0;
  buzzer.reset();
});

onStateEntry('completed', () => {
  buzzer.reset;
});

const start = transition('preparing', () => {
  const changeTimes = controllers.value.reduce(
    (changes, controller) => {
      changes[controller.id] = [];
      return changes;
    },
    {} as Record<string, number[]>,
  );

  return {
    game: 'viewing-rates',
    name: 'running',
    time: 0,
    changeTimes: changeTimes,
  };
});

const pause = transition('running', (state) => {
  return {
    game: 'viewing-rates',
    name: 'paused',
    time: state.time,
    changeTimes: state.changeTimes,
  };
});

const resume = transition('paused', (state) => {
  return {
    game: 'viewing-rates',
    name: 'running',
    time: state.time,
    changeTimes: state.changeTimes,
  };
});

const cancel = transition(['paused', 'completed'], (state) => {
  return {
    game: 'viewing-rates',
    name: 'preparing',
    time: state.time,
    changeTimes: state.changeTimes,
  };
});

const stop = transition('running', (state) => {
  return {
    game: 'viewing-rates',
    name: 'completed',
    time: state.time,
    changeTimes: state.changeTimes,
  };
});

const controllerWatchStatus = (changes: number[]): boolean => {
  return changes.length % 2 === 1;
};

const isControllerViewing = (
  state: ViewingRateRunningState,
  controllerId: string,
): boolean => {
  return controllerWatchStatus(state.changeTimes[controllerId] ?? []);
};

const listener = transition('running', (state, event: ButtonEvent) => {
  const controllerId = event.controller.id;
  const changes = { ...state.changeTimes };
  if (!(controllerId in changes)) {
    changes[controllerId] = [];
  }
  changes[controllerId].push(time.value);

  event.controller.setLight(isControllerViewing(state, event.controller.id));

  return {
    game: 'viewing-rates',
    name: 'running',
    time: state.time,
    changeTimes: changes,
  };
});

const toRoundedPercentage = (n: number): string => {
  const rounded = Math.round(n * 10000) / 100;
  const percentage = rounded.toFixed(2);

  return percentage + ' %';
};
</script>

<style scoped></style>
