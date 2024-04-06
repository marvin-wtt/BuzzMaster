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
                {{ gameState.controller.name }}
              </div>
              <count-down
                v-if="buzzerSettings.answerTime > 0"
                v-model="gameState.time"
                :paused="gameState.correct !== undefined"
                :beep="soundsEnabled"
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
                t('question.buzzer.controllersReady', {
                  count: controllers.length,
                })
              }}
            </div>
            <div v-else>
              {{ t('question.buzzer.waitingForBuzzer') }}
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
            :label="t('question.buzzer.action.start')"
            color="primary"
            rounded
            @click="start()"
          />
          <q-btn
            :label="t('question.buzzer.action.settings')"
            outline
            rounded
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
            :controller="gameState.controller"
            @update="onScored"
          />

          <div class="q-pt-md">
            <q-separator />
          </div>

          <!-- First row -->
          <div class="row">
            <div class="col-6 column justify-center content-end">
              <q-btn
                :label="t('question.buzzer.action.reOpen')"
                icon="loop"
                color="primary"
                class="q-mx-sm"
                rounded
                :outline="allControllersPressed"
                :disable="allControllersPressed"
                @click="continueQuestion()"
              />
            </div>
            <div class="col-6 column justify-center content-start">
              <q-btn
                :label="t('question.buzzer.action.quickPlay')"
                icon="fast_forward"
                color="primary"
                class="q-mx-sm"
                rounded
                @click="quickPlay()"
              />
            </div>
          </div>
          <!-- Second row -->
          <div class="row justify-center">
            <q-btn
              :label="t('question.buzzer.action.reset')"
              icon="replay"
              outline
              rounded
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
              :label="t('question.buzzer.action.cancel')"
              outline
              rounded
              @click="restart()"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import BuzzerScoreboardButtons from 'components/questions/buzzer/BuzzerScoreboardButtons.vue';
import BuzzerQuestionDialog from 'components/questions/buzzer/BuzzerQuestionDialog.vue';
import CountDown from 'components/CountDown.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import { ButtonEvent, BuzzerButton } from 'src/plugins/buzzer/types';
import { useQuasar } from 'quasar';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { useI18n } from 'vue-i18n';
import { BuzzerState } from 'app/common/GameState';

interface Size {
  width: number;
  height: number;
}

const quasar = useQuasar();
const { t } = useI18n();
const { buzzerSettings } = useQuestionSettingsStore();
const { controllers, buzzer } = useBuzzer();

const gameState = ref<BuzzerState>({
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

const soundsEnabled = computed<boolean>(() => {
  return buzzerSettings.playSounds;
});

const onCircleTimerResize = (size?: { width: number; height: number }) => {
  size ??= circleSize.value ?? { width: 0, height: 0 };
  const elementWidth = size.width;
  const pressedController =
    gameState.value.name === 'answering'
      ? gameState.value.controller
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

watch(gameState, () => {
  onCircleTimerResize();
});

// Measure normal text width
const canvas = document.createElement('canvas');
const textMetrics = (text: string) => {
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

const allControllersPressed = computed<boolean>(() => {
  if (gameState.value.name !== 'answering') {
    return false;
  }

  const disabledControllerIds = gameState.value.disabledControllerIds;

  return !controllers.value.some(
    (controller) => !disabledControllerIds.includes(controller.id),
  );
});

const showScoreboardActions = computed<boolean>(() => {
  return buzzerSettings.pointsCorrect !== 0 || buzzerSettings.pointsWrong !== 0;
});

const listener = (event: ButtonEvent) => {
  if (gameState.value.name !== 'running') {
    return;
  }

  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (
    !buzzerSettings.multipleAttempts &&
    gameState.value.disabledControllerIds.includes(event.controller.id)
  ) {
    return;
  }

  if (soundsEnabled.value) {
    audio.play();
  }

  const disabledControllerIds = gameState.value.disabledControllerIds;
  disabledControllerIds.push(event.controller.id);

  gameState.value = {
    game: 'buzzer',
    name: 'answering',
    time: buzzerSettings.answerTime,
    controller: event.controller,
    disabledControllerIds,
  };

  event.controller.setLight(true);
};

const onScored = (correct: boolean | undefined, points: number | undefined) => {
  if (gameState.value.name !== 'answering') {
    return;
  }

  gameState.value = {
    game: 'buzzer',
    name: 'answering',
    time: gameState.value.time,
    controller: gameState.value.controller,
    disabledControllerIds: gameState.value.disabledControllerIds,
    correct,
    points,
  };
};

const continueQuestion = () => {
  if (gameState.value.name !== 'answering') {
    return;
  }

  buzzer.reset();

  gameState.value = {
    game: 'buzzer',
    name: 'running',
    disabledControllerIds: gameState.value.disabledControllerIds,
  };
};

const restart = () => {
  buzzer.reset();

  gameState.value = {
    game: 'buzzer',
    name: 'preparing',
  };
};

const quickPlay = () => {
  restart();
  start();
};

const start = () => {
  gameState.value = {
    game: 'buzzer',
    name: 'running',
    disabledControllerIds: [],
  };
};

const settings = () => {
  quasar.dialog({
    component: BuzzerQuestionDialog,
  });
};
</script>

<style scoped></style>
