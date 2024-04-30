<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column no-wrap">
      <!-- Content -->
      <div class="col-7 row justify-center">
        <div
          class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center justify-center"
        >
          <!-- Result -->
          <circle-timer
            v-if="gameState.name === 'answering'"
            v-model="gameState.time"
            :max="buzzerSettings.answerTime"
          >
            <q-resize-observer @resize="onCircleTimerResize" />

            <div class="column justify-center q-col-gutter-xs">
              <div :style="controllerNameStyle">
                {{ findControllerById(gameState.controller).name }}
              </div>
              <beep-timer
                v-if="buzzerSettings.answerTime > 0"
                :time="gameState.time"
                :beep="buzzerSettings.playSounds"
                :beep-start-time="buzzerSettings.countDownBeepStartAt"
                :style="countDownStyle"
                animated
              />
            </div>
          </circle-timer>
          <!-- Waiting -->
          <pulse-circle
            v-else
            class="column justify-center q-col-gutter-sm text-h5"
            :pulse="gameState.name === 'running'"
          >
            <div v-if="gameState.name === 'preparing'">
              {{
                t('gameMode.buzzer.controllersReady', {
                  count: controllers.length,
                })
              }}
            </div>
            <div v-else>
              {{ t('gameMode.buzzer.waitingForBuzzer') }}
            </div>
          </pulse-circle>
        </div>
      </div>
      <!-- Actions -->
      <div class="col-5 row justify-center no-wrap">
        <!-- Start menu -->
        <div
          v-if="gameState.name === 'preparing'"
          class="column q-gutter-sm justify-center"
        >
          <q-btn
            :label="t('gameMode.buzzer.action.start')"
            color="primary"
            rounded
            data-testid="btn-game-start"
            @click="start()"
          />
          <q-btn
            :label="t('gameMode.buzzer.action.settings')"
            outline
            rounded
            data-testid="btn-game-settings"
            @click="settings"
          />
        </div>

        <!-- Result menu -->
        <div
          v-else-if="gameState.name === 'answering'"
          class="column col-xs-10 col-sm-7 col-md-6 col-lg-4 col-xl-3 justify-center q-col-gutter-y-sm"
        >
          <!-- Scoreboard -->
          <buzzer-scoreboard-buttons
            v-if="showScoreboardActions"
            :controller="findControllerById(gameState.controller)"
            @update="onScored"
          />

          <div class="q-pt-md">
            <q-separator />
          </div>

          <!-- First row -->
          <div class="row">
            <div class="col-6 column justify-center content-end">
              <q-btn
                :label="t('gameMode.buzzer.action.reOpen')"
                icon="loop"
                color="primary"
                class="q-mx-sm"
                rounded
                :outline="allControllersPressed"
                :disable="allControllersPressed"
                data-testid="btn-game-reopen"
                @click="continueQuestion()"
              />
            </div>
            <div class="col-6 column justify-center content-start">
              <q-btn
                :label="t('gameMode.buzzer.action.quickPlay')"
                icon="fast_forward"
                color="primary"
                class="q-mx-sm"
                rounded
                data-testid="btn-game-quick-play"
                @click="quickPlay()"
              />
            </div>
          </div>
          <!-- Second row -->
          <div class="row justify-center">
            <q-btn
              :label="t('gameMode.buzzer.action.reset')"
              icon="replay"
              outline
              rounded
              data-testid="btn-game-restart"
              @click="restart()"
            />
          </div>
        </div>

        <div
          v-if="gameState.name === 'running'"
          class="row justify-center"
        >
          <div class="column justify-center">
            <q-btn
              :label="t('gameMode.buzzer.action.cancel')"
              outline
              rounded
              data-testid="btn-game-cancel"
              @click="restart()"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import BuzzerScoreboardButtons from 'components/gameModes/buzzer/BuzzerScoreboardButtons.vue';
import BuzzerSettingsDialog from 'components/gameModes/buzzer/BuzzerSettingsDialog.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import {
  computed,
  onBeforeMount,
  onUnmounted,
  ref,
  watch,
  watchEffect,
} from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useQuasar } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { useGameState } from 'src/composables/gameState';
import BeepTimer from 'components/BeepTimer.vue';
import { useTimer } from 'src/composables/timer';

interface Size {
  width: number;
  height: number;
}

const quasar = useQuasar();
const { t } = useI18n();
const { buzzerSettings } = useGameSettingsStore();
const { controllers, buzzer } = useBuzzer();
const { time, stopTimer, startTimer } = useTimer({
  updateRate: 100,
  direction: 'down',
});
const { gameState, transition, onStateEntry, onStateExit } =
  useGameState<BuzzerState>({
    game: 'buzzer',
    name: 'preparing',
  });

const controllerNameStyle = ref<string | { fontSize: string }>('');
const countDownStyle = ref<string | { fontSize: string }>('');
const circleSize = ref<Size>();

const audio = new Audio('sounds/buzzer.mp3');

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);

  audio.load();
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});

// Measure normal text width
const canvas = document.createElement('canvas');
const textMetrics = (text: string) => {
  // Canvas is not present in testing environment.
  // This is a workaround until either canvas is added or a simple stub is found
  if (!('getContext' in canvas)) {
    return { width: 0, height: 0 };
  }
  const context = canvas.getContext('2d');
  if (context === null) {
    return { width: 0, height: 0 };
  }
  context.font = '12pt arial';
  const metrics = context.measureText(text);
  const height =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  return {
    width: metrics.width,
    height,
  };
};

const onCircleTimerResize = (size?: { width: number; height: number }) => {
  size ??= circleSize.value ?? { width: 0, height: 0 };
  const elementWidth = size.width;
  const pressedController =
    gameState.value.name === 'answering'
      ? findControllerById(gameState.value.controller)
      : undefined;

  // Magical numbers so that the font size stays within the circle with padding
  const scaleFactor = 8.5;
  const heightFactor = 3;
  const countDownScale = 0.75;

  const { width, height } = textMetrics(pressedController?.name ?? '');
  if (!elementWidth || !pressedController) {
    return;
  }

  let scale = elementWidth / width;
  // Rescale for height if the height outgrows the circle
  if (height * heightFactor * scale > elementWidth) {
    scale = elementWidth / (height * heightFactor);
  }

  const fontSize = scaleFactor * scale;
  controllerNameStyle.value = {
    fontSize: `${fontSize}pt`,
  };

  const countDownFontSize = fontSize * countDownScale;
  countDownStyle.value = {
    fontSize: `${countDownFontSize}pt`,
  };
};

watchEffect(() => {
  onCircleTimerResize();
});

const allControllersPressed = computed<boolean>(() => {
  if (gameState.value.name !== 'answering') {
    return false;
  }

  const pressedControllers = gameState.value.pressedControllers;

  return !controllers.value.some(
    (controller) => !pressedControllers.includes(controller.id),
  );
});

const showScoreboardActions = computed<boolean>(() => {
  return buzzerSettings.pointsCorrect !== 0 || buzzerSettings.pointsWrong !== 0;
});

const listener = transition('running', (state, event: ButtonEvent) => {
  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (
    !buzzerSettings.multipleAttempts &&
    state.pressedControllers.includes(event.controller.id)
  ) {
    return;
  }

  event.controller.setLight(true);

  if (buzzerSettings.playSounds) {
    audio.play();
  }

  const pressedControllers = [...state.pressedControllers];
  if (!state.pressedControllers.includes(event.controller.id)) {
    pressedControllers.push(event.controller.id);
  }

  return {
    game: 'buzzer',
    name: 'answering',
    time: buzzerSettings.answerTime,
    controller: event.controller.id,
    pressedControllers,
  };
});

const tick = transition('answering', (state, time: number) => {
  if (time <= 0) {
    stopTimer();
  }

  return {
    ...state,
    time,
  };
});
watch(time, tick);

onStateEntry('preparing', () => {
  buzzer.reset();
});

onStateEntry('answering', (state) => {
  time.value = state.time;
  startTimer();
});
onStateExit('answering', () => {
  stopTimer();
  buzzer.reset();
});

const onScored = transition(
  'answering',
  (state, correct: boolean | undefined, points: number | undefined) => {
    return {
      game: 'buzzer',
      name: 'answering',
      time: state.time,
      controller: state.controller,
      pressedControllers: state.pressedControllers,
      correct,
      points,
    };
  },
);

const continueQuestion = transition('answering', (state) => {
  return {
    game: 'buzzer',
    name: 'running',
    pressedControllers: state.pressedControllers,
  };
});

const restart = transition(['running', 'answering'], () => {
  return {
    game: 'buzzer',
    name: 'preparing',
  };
});

const quickPlay = () => {
  restart();
  start();
};

const start = transition('preparing', () => {
  return {
    game: 'buzzer',
    name: 'running',
    pressedControllers: [],
  };
});

const settings = () => {
  quasar.dialog({
    component: BuzzerSettingsDialog,
  });
};

const findControllerById = (id: string): IController => {
  const controller = controllers.value.find(
    (controller) => controller.id === id,
  );

  if (!controller) {
    throw new Error('Cannot find controller with id ' + id);
  }

  return controller;
};
</script>

<style scoped></style>