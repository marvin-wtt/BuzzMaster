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
          <count-down
            v-model="gameState.time"
            :paused="gameState.name === 'completed'"
            :precision="2"
            :update-rate="100"
            reverse
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
                    v-if="item.time === undefined"
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
        <div
          v-if="gameState.name === 'preparing'"
          class="column q-gutter-sm"
        >
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
        </div>

        <div
          v-else-if="gameState.name === 'running'"
          class="column q-gutter-sm"
        >
          <q-btn
            :label="t('question.stopwatch.action.stop')"
            outline
            rounded
            @click="stop()"
          />
          <q-btn
            :label="t('question.stopwatch.action.cancel')"
            outline
            rounded
            @click="restart()"
          />
        </div>

        <template v-else-if="gameState.name === 'completed'">
          <stopwatch-scoreboard-button
            :label="t('question.stopwatch.action.scores')"
            :controllers="controllers"
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
import CountDown from 'components/CountDown.vue';
import { computed, onBeforeMount, onUnmounted, ref } from 'vue';
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

const { t } = useI18n();
const quasar = useQuasar();
const { stopwatchSettings } = useQuestionSettingsStore();
const { controllers, buzzer } = useBuzzer();

const gameState = ref<StopwatchState>({
  game: 'stopwatch',
  name: 'preparing',
});
const startTime = ref<number>(0);

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

const soundsEnabled = computed<boolean>(() => {
  return stopwatchSettings.playSounds;
});

type StopwatchEntry = {
  controller: IController;
  time: number | undefined;
};

const result = computed<StopwatchEntry[]>(() => {
  const state = gameState.value;
  if (state.name !== 'running' && state.name !== 'completed') {
    return [];
  }

  return controllers.value
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

  if (!(event.controller.id in gameState.value.result)) {
    return;
  }

  // Calculate exact time so that timer interval does not affect precision
  const time = new Date().getTime() - startTime.value;

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
    onComplete();
  }

  if (soundsEnabled.value) {
    const clonedAudio = audio.cloneNode() as typeof audio;
    clonedAudio.play();
  }
};

const onComplete = () => {
  if (gameState.value.name !== 'running') {
    return;
  }

  gameState.value = {
    game: 'stopwatch',
    name: 'completed',
    time: gameState.value.time,
    result: gameState.value.result,
  };
};

const openSettings = () => {
  quasar.dialog({
    component: StopwatchQuestionDialog,
  });
};

const stop = () => {
  if (gameState.value.name !== 'running') {
    return;
  }

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
  gameState.value = {
    game: 'stopwatch',
    name: 'running',
    time: 0,
    result: {},
  };

  startTime.value = new Date().getTime();
};

const formatTime = (time: number | undefined) => {
  if (time === undefined) {
    return t('question.stopwatch.disqualified');
  }

  const date = new Date(time);

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

  if (gameState.value.name === 'running') {
    const result = { ...gameState.value.result };
    delete result[controller.id];

    gameState.value = {
      game: 'stopwatch',
      name: 'completed',
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
