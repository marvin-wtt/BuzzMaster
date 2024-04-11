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

                <q-item-section>
                  {{ item.controller.name }}
                </q-item-section>

                <q-item-section side>
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
        >
          {{
            t('question.stopwatch.controllersReady', {
              count: controllers.length,
            })
          }}
        </div>
      </div>
      <!-- Actions -->
      <div class="col-4 column q-gutter-y-sm justify-center content-center">
        <template v-if="gameState.name === 'preparing'">
          <q-btn
            :label="t('question.stopwatch.action.start')"
            color="primary"
            rounded
            @click="start()"
          />
          <q-btn
            :label="t('question.quiz.action.settings')"
            outline
            rounded
            @click="openSettings"
          />
        </template>

        <template v-else-if="gameState.name === 'running'">
          <q-btn
            :label="t('question.stopwatch.action.pause')"
            class="self-center"
            outline
            rounded
            @click="pause()"
          />
          <q-btn
            :label="t('question.stopwatch.action.cancel')"
            class="self-center"
            outline
            rounded
            @click="restart()"
          />
        </template>

        <div
          v-else-if="gameState.name === 'paused'"
          class="column q-gutter-sm"
        >
          <div class="q-gutter-x-sm">
            <q-btn
              :label="t('question.stopwatch.action.resume')"
              color="primary"
              rounded
              @click="resume()"
            />
            <q-btn
              :label="t('question.stopwatch.action.stop')"
              outline
              rounded
              @click="stop()"
            />
          </div>
          <q-btn
            :label="t('question.stopwatch.action.cancel')"
            class="self-center"
            outline
            rounded
            @click="restart()"
          />
        </div>

        <template v-else-if="gameState.name === 'completed'">
          <stopwatch-scoreboard-button
            :label="t('question.stopwatch.action.scores')"
            :result="result"
          />

          <q-separator />
          <!-- First row -->
          <q-btn
            :label="t('question.stopwatch.action.quickPlay')"
            icon="fast_forward"
            color="primary"
            class="self-center"
            rounded
            @click="quickPlay()"
          />
          <!-- Second row -->
          <q-btn
            :label="t('question.stopwatch.action.reset')"
            icon="replay"
            class="self-center"
            outline
            rounded
            @click="restart()"
          />
        </template>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import SafeDeleteBtn from 'components/SafeDeleteBtn.vue';
import StopwatchQuestionDialog from 'components/questions/stopwatch/StopwatchQuestionDialog.vue';
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';
import StopwatchScoreboardButton from 'components/questions/stopwatch/StopwatchScoreboardButton.vue';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { useQuasar } from 'quasar';
import { StopwatchState } from 'app/common/GameState';
import { StopwatchEntry } from 'components/questions/stopwatch/StopwatchEntry';
import BeepTimer from 'components/BeepTimer.vue';
import { useTimer } from 'src/composables/timer';

const { t } = useI18n();
const quasar = useQuasar();
const { stopwatchSettings } = useQuestionSettingsStore();
const { controllers, buzzer } = useBuzzer();
const { time, stopTimer, startTimer, exactTime } = useTimer({
  updateRate: 100,
});

const gameState = ref<StopwatchState>({
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

watch(time, (value) => {
  if (gameState.value.name === 'preparing') {
    return;
  }

  // Update state
  gameState.value = {
    ...gameState.value,
    time: value,
  };
});

const soundsEnabled = computed<boolean>(() => {
  return stopwatchSettings.playSounds;
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
        controller.id in state.result ? state.result[controller.id] : undefined;

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

const listener = (event: ButtonEvent) => {
  if (gameState.value.name !== 'running') {
    return;
  }

  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (event.controller.id in gameState.value.result) {
    return;
  }

  // Calculate exact time so that timer interval does not affect precision
  const time = exactTime();

  gameState.value = {
    game: 'stopwatch',
    name: 'running',
    time: gameState.value.time,
    result: {
      ...gameState.value.result,
      [event.controller.id]: time,
    },
  };

  event.controller.setLight(true);

  if (Object.keys(gameState.value.result).length === controllers.value.length) {
    gameState.value = {
      game: 'stopwatch',
      name: 'completed',
      time: gameState.value.time,
      result: gameState.value.result,
    };
  }

  if (soundsEnabled.value) {
    const clonedAudio = audio.cloneNode() as typeof audio;
    clonedAudio.play();
  }
};

const openSettings = () => {
  quasar.dialog({
    component: StopwatchQuestionDialog,
  });
};

const pause = () => {
  if (gameState.value.name !== 'running') {
    return;
  }

  stopTimer();

  gameState.value = {
    game: 'stopwatch',
    name: 'paused',
    time: gameState.value.time,
    result: gameState.value.result,
  };
};

const resume = () => {
  if (gameState.value.name !== 'paused') {
    return;
  }

  startTimer();

  gameState.value = {
    game: 'stopwatch',
    name: 'running',
    time: gameState.value.time,
    result: gameState.value.result,
  };
};

const stop = () => {
  if (gameState.value.name !== 'paused') {
    return;
  }

  stopTimer();

  const result: Record<string, number | undefined> = gameState.value.result;
  for (const controller of controllers.value) {
    if (controller.id in result) {
      continue;
    }

    result[controller.id] = undefined;
  }

  gameState.value = {
    game: 'stopwatch',
    name: 'completed',
    time: gameState.value.time,
    result,
  };
};

const restart = () => {
  stopTimer();
  time.value = 0;

  buzzer.reset();

  gameState.value = {
    game: 'stopwatch',
    name: 'preparing',
  };
};

const quickPlay = () => {
  restart();
  start();
};

const start = () => {
  startTimer();

  gameState.value = {
    game: 'stopwatch',
    name: 'running',
    time: 0,
    result: {},
  };
};

const formatTime = (time: number | undefined) => {
  if (time === undefined) {
    return t('question.stopwatch.disqualified');
  }

  const date = new Date(time * 1000);

  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds())
    .padStart(3, '0')
    .slice(0, 2);

  return `${minutes}:${seconds}.${milliseconds}`;
};

const removeController = (controller: IController) => {
  if (gameState.value.name === 'completed') {
    gameState.value = {
      game: 'stopwatch',
      name: 'completed',
      time: gameState.value.time,
      result: {
        ...gameState.value.result,
        [controller.id]: undefined,
      },
    };

    controller.setLight(false);

    return;
  }

  if (gameState.value.name === 'running' || gameState.value.name === 'paused') {
    const result = { ...gameState.value.result };
    delete result[controller.id];

    gameState.value = {
      game: 'stopwatch',
      name: gameState.value.name,
      time: gameState.value.time,
      result,
    };

    controller.setLight(false);

    return;
  }
};

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
