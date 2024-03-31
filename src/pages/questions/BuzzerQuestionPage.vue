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
            v-if="started && pressedController"
            v-model="countDownTime"
            :max="buzzerSettings.answerTime"
          >
            <q-resize-observer @resize="onCircleTimerResize" />

            <div class="column justify-center q-col-gutter-xs">
              <div :style="controllerNameStyle">
                {{ pressedController.name }}
              </div>
              <count-down
                v-if="buzzerSettings.answerTime > 0"
                v-model="countDownTime"
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
            :pulse="started"
          >
            <div v-if="!started">
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
          v-if="!started"
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
          class="column col-xs-10 col-sm-7 col-md-6 col-lg-4 col-xl-3 justify-center q-col-gutter-y-sm"
          v-if="pressedController"
        >
          <!-- Scoreboard -->
          <buzzer-scoreboard-buttons
            v-if="showScoreboardActions"
            :controller="pressedController"
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
          v-if="started && !pressedController"
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
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useQuasar } from 'quasar';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { useI18n } from 'vue-i18n';

interface Size {
  width: number;
  height: number;
}

const quasar = useQuasar();
const { t } = useI18n();
const { buzzerSettings } = useQuestionSettingsStore();
const { controllers, buzzer } = useBuzzer();

const controllerNameStyle = ref<string | { fontSize: string }>('');
const countDownStyle = ref<string | { fontSize: string }>('');
const circleSize = ref<Size>();
const pressedController = ref<IController>();
const started = ref<boolean>(false);
const pressedControllers = ref<string[]>([]);
const countDownTime = ref<number>(0);

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

  // Magical numbers so that the font size stays within the circle with padding
  const scaleFactor = 8.5;
  const heightFactor = 3;
  const countDownScale = 0.75;

  const { width, height } = textMetrics(pressedController.value?.name ?? '');
  if (!elementWidth || !pressedController.value) {
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

watch([pressedController], () => {
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
  return !controllers.value.some(
    (controller) => !pressedControllers.value.includes(controller.id),
  );
});

const showScoreboardActions = computed<boolean>(() => {
  return buzzerSettings.pointsCorrect !== 0 || buzzerSettings.pointsWrong !== 0;
});

const listener = (event: ButtonEvent) => {
  if (!started.value) {
    return;
  }

  if (pressedController.value !== undefined) {
    return;
  }

  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (
    !buzzerSettings.multipleAttempts &&
    pressedControllers.value.includes(event.controller.id)
  ) {
    return;
  }

  if (soundsEnabled.value) {
    audio.play();
  }

  countDownTime.value = buzzerSettings.answerTime;
  pressedController.value = event.controller;
  pressedControllers.value.push(event.controller.id);

  event.controller.setLight(true);
};

const continueQuestion = () => {
  buzzer.reset();

  pressedController.value = undefined;
};

const restart = () => {
  buzzer.reset();

  pressedControllers.value = [];
  pressedController.value = undefined;
  started.value = false;
};

const quickPlay = () => {
  restart();
  start();
};

const start = () => {
  started.value = true;
};

const settings = () => {
  quasar.dialog({
    component: BuzzerQuestionDialog,
  });
};
</script>

<style scoped></style>
