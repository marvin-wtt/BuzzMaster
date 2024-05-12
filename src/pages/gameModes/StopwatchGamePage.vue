<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column no-wrap">
      <!-- Content -->
      <div class="col-8 row justify-center">
        <div
          v-if="gameState.name !== 'preparing'"
          class="column col-xs-11 col-sm-7 col-md-5 col-lg-3 col-xl-2 q-mb-sm"
        >
          <!-- Result -->
          <beep-timer
            :time="gameState.time"
            :precision="2"
            class="text-center text-h6"
            data-testid="timer"
          />

          <q-separator />

          <div class="col-grow relative-position">
            <q-virtual-scroll
              :items="result"
              class="absolute fit"
              v-slot="{ item, index }: { item: StopwatchEntry; index: number }"
            >
              <q-item
                :key="item.controller.id"
                dense
                data-testid="result-item"
              >
                <q-item-section avatar>
                  <q-avatar
                    v-if="item.time !== undefined"
                    :color="avatarColor(index)"
                    text-color="white"
                    size="sm"
                  >
                    {{ index + 1 }}
                  </q-avatar>
                  <q-avatar
                    v-else
                    :color="avatarColor(-1)"
                    text-color="white"
                    size="sm"
                  >
                    -
                  </q-avatar>
                </q-item-section>

                <q-item-section data-testid="result-item-name">
                  {{ item.controller.name }}
                </q-item-section>

                <q-item-section
                  data-testid="result-item-time"
                  side
                >
                  {{ formatTime(item.time) }}
                </q-item-section>

                <q-item-section side>
                  <!-- Disqualified buttons are undefined -->
                  <safe-delete-btn
                    v-if="item.time !== undefined"
                    icon="close"
                    size="sm"
                    rounded
                    dense
                    data-testid="btn-remove-result"
                    @click="removeController(item.controller)"
                  />

                  <q-btn
                    v-else
                    icon="block"
                    size="sm"
                    rounded
                    dense
                    disable
                  />
                </q-item-section>
              </q-item>
            </q-virtual-scroll>
          </div>
        </div>
        <div
          v-else
          class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center text-h5"
          data-testid="controllers-ready"
        >
          {{
            t('gameMode.stopwatch.controllersReady', {
              count: controllers.length,
            })
          }}
        </div>
      </div>
      <!-- Actions -->
      <div class="col-4 column q-gutter-y-sm justify-center content-center">
        <template v-if="gameState.name === 'preparing'">
          <q-btn
            :label="t('gameMode.stopwatch.action.start')"
            color="primary"
            rounded
            data-testid="btn-game-start"
            @click="start()"
          />
          <q-btn
            :label="t('gameMode.quiz.action.settings')"
            outline
            rounded
            @click="openSettings"
          />
        </template>

        <template v-else-if="gameState.name === 'running'">
          <q-btn
            :label="t('gameMode.stopwatch.action.pause')"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-pause"
            @click="pause()"
          />
          <q-btn
            :label="t('gameMode.stopwatch.action.cancel')"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-cancel"
            @click="restart()"
          />
        </template>

        <div
          v-else-if="gameState.name === 'paused'"
          class="column q-gutter-sm"
        >
          <div class="q-gutter-x-sm">
            <q-btn
              :label="t('gameMode.stopwatch.action.resume')"
              color="primary"
              rounded
              data-testid="btn-game-resume"
              @click="resume()"
            />
            <q-btn
              :label="t('gameMode.stopwatch.action.stop')"
              outline
              rounded
              data-testid="btn-game-stop"
              @click="stop()"
            />
          </div>
          <q-btn
            :label="t('gameMode.stopwatch.action.cancel')"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-cancel"
            @click="restart()"
          />
        </div>

        <template v-else-if="gameState.name === 'completed'">
          <stopwatch-leaderboard-button
            :label="t('gameMode.stopwatch.action.points')"
            :result="result"
            @update="onScore"
          />

          <q-separator />
          <!-- First row -->
          <q-btn
            :label="t('gameMode.stopwatch.action.quickPlay')"
            icon="fast_forward"
            color="primary"
            class="self-center"
            rounded
            data-testid="btn-game-quick-play"
            @click="quickPlay()"
          />
          <!-- Second row -->
          <q-btn
            :label="t('gameMode.stopwatch.action.reset')"
            icon="replay"
            class="self-center"
            outline
            rounded
            data-testid="btn-game-restart"
            @click="restart()"
          />
        </template>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import SafeDeleteBtn from 'components/SafeDeleteBtn.vue';
import StopwatchSettingsDialog from 'components/gameModes/stopwatch/StopwatchSettingsDialog.vue';
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';
import StopwatchLeaderboardButton from 'components/gameModes/stopwatch/StopwatchLeaderboardButton.vue';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useQuasar } from 'quasar';
import {
  StopwatchRunningState,
  StopwatchState,
} from 'app/common/gameState/StopwatchState';
import { StopwatchEntry } from 'components/gameModes/stopwatch/StopwatchEntry';
import BeepTimer from 'components/TimerAnimated.vue';
import { useTimer } from 'src/composables/timer';
import { useGameState } from 'src/composables/gameState';

const { t } = useI18n();
const quasar = useQuasar();
const { stopwatchSettings } = useGameSettingsStore();
const { controllers, buzzer } = useBuzzer();
const { time, stopTimer, startTimer, exactTime } = useTimer({
  updateRate: 100,
});
const { gameState, transition, createEvent, onStateEntry, onStateExit } =
  useGameState<StopwatchState>({
    game: 'stopwatch',
    name: 'preparing',
  });

const audio = new Audio('sounds/stopwatch-ping.mp3');

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);

  audio.load();
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});

const tick = transition('running', (state, time: number) => {
  return {
    ...gameState.value,
    time,
  };
});
watch(time, tick);

onStateEntry('preparing', () => {
  buzzer.reset();
});
onStateEntry('running', (state: StopwatchRunningState) => {
  time.value = state.time;
  startTimer();
});

onStateExit('running', () => {
  stopTimer();
});

const result = computed<StopwatchEntry[]>(() => {
  const state = gameState.value;
  if (
    state.name !== 'running' &&
    state.name !== 'paused' &&
    state.name !== 'completed'
  ) {
    return [];
  }

  return controllers.value
    .filter((controller) => {
      return state.name === 'completed' || controller.id in state.result;
    })
    .map((controller): StopwatchEntry => {
      const time =
        controller.id in state.result
          ? state.result[controller.id] ?? undefined
          : undefined;

      return {
        controller,
        time,
      };
    })
    .sort((a, b) => {
      if (a.time === undefined && b.time === undefined) {
        return 0;
      }

      if (a.time === undefined) {
        return 1;
      }

      if (b.time === undefined) {
        return -1;
      }

      return a.time - b.time;
    });
});

const listener = transition('running', (state, event: ButtonEvent) => {
  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (event.controller.id in state.result) {
    return;
  }

  event.controller.setLight(true);

  if (stopwatchSettings.playSounds) {
    const clonedAudio = audio.cloneNode() as typeof audio;
    clonedAudio.play();
  }

  // Calculate exact time so that timer interval does not affect precision
  const time = exactTime();
  const result = {
    ...state.result,
    [event.controller.id]: time,
  };

  if (Object.keys(result).length === controllers.value.length) {
    return {
      game: 'stopwatch',
      name: 'completed',
      time: state.time,
      result,
    };
  }

  return {
    game: 'stopwatch',
    name: 'running',
    time: state.time,
    result,
  };
});

const openSettings = () => {
  quasar.dialog({
    component: StopwatchSettingsDialog,
  });
};

const pause = transition('running', (state) => {
  return {
    game: 'stopwatch',
    name: 'paused',
    time: state.time,
    result: state.result,
  };
});

const resume = transition('paused', (state) => {
  return {
    game: 'stopwatch',
    name: 'running',
    time: state.time,
    result: state.result,
  };
});

const stop = transition('paused', (state) => {
  const result: Record<string, number | null> = state.result;
  for (const controller of controllers.value) {
    if (controller.id in result) {
      continue;
    }

    result[controller.id] = null;
  }

  return {
    game: 'stopwatch',
    name: 'completed',
    time: state.time,
    result,
  };
});

const restart = transition(['running', 'paused', 'completed'], () => {
  return {
    game: 'stopwatch',
    name: 'preparing',
  };
});

const quickPlay = () => {
  restart();
  start();
};

const start = transition('preparing', () => {
  return {
    game: 'stopwatch',
    name: 'running',
    time: 0,
    result: {},
  };
});

const formatTime = (time: number | undefined) => {
  if (time === undefined) {
    return t('gameMode.stopwatch.disqualified');
  }

  const date = new Date(time * 1000);

  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds())
    .padStart(3, '0')
    .slice(0, 2);

  return `${minutes}:${seconds}.${milliseconds}`;
};

const removeController = createEvent([
  transition(['running', 'paused'], (state, controller: IController) => {
    controller.setLight(false);

    const result = { ...state.result };
    delete result[controller.id];

    return {
      game: 'stopwatch',
      name: state.name,
      time: state.time,
      result,
    };
  }),
  transition('completed', (state, controller: IController) => {
    controller.setLight(false);

    return {
      game: 'stopwatch',
      name: 'completed',
      time: state.time,
      result: {
        ...state.result,
        [controller.id]: null,
      },
      points: state.points,
    };
  }),
]);

const onScore = transition(
  'completed',
  (state, points: Record<string, number | undefined>) => {
    return {
      game: 'stopwatch',
      name: 'completed',
      result: state.result,
      time: state.time,
      points,
    };
  },
);

const avatarColor = (index: number) => {
  switch (index) {
    case 0:
      return 'primary';
    case 1:
      return 'secondary';
    case 2:
      return 'info';
  }

  return 'grey';
};
</script>
