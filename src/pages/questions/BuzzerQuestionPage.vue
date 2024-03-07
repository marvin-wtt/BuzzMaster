<template>
  <navigation-bar
    title="Buzzer"
    padding
  >
    <div class="col-12 column justify-around">
      <!-- Content -->
      <div class="col-grow row justify-center">
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
            :pulse="pulse"
          >
            <div v-if="!started">
              {{ controllers.length + ' controllers ready!' }}
            </div>
            <div v-else>Waiting for buzzer...</div>
          </pulse-circle>
        </div>
      </div>
      <!-- Actions -->
      <div class="col-2 column content-center">
        <div
          v-if="!started"
          class="column q-gutter-sm"
        >
          <q-btn
            label="Start"
            color="primary"
            rounded
            @click="start()"
          />
          <q-btn
            label="Settings"
            outline
            rounded
            @click="settings"
          />
        </div>

        <div
          class="col-12"
          v-if="pressedController"
        >
          <!-- First row -->
          <div class="row q-gutter-sm">
            <q-btn
              label="Re-open"
              icon="loop"
              color="primary"
              rounded
              :outline="allControllersPressed"
              :disable="allControllersPressed"
              @click="continueQuestion()"
            />
            <q-btn
              label="Quick Play"
              icon="fast_forward"
              color="primary"
              rounded
              @click="quickPlay()"
            />
          </div>
          <!-- Second row -->
          <div class="row justify-center q-mt-md">
            <q-btn
              label="Reset"
              icon="replay"
              outline
              rounded
              @click="restart()"
            />
          </div>
        </div>

        <div v-if="started && !pressedController">
          <q-btn
            label="Cancel"
            outline
            rounded
            @click="restart()"
          />
        </div>
      </div>
    </div>
  </navigation-bar>
</template>

<script lang="ts" setup>
import NavigationBar from 'components/PageNavigation.vue';
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useQuasar } from 'quasar';
import BuzzerQuestionDialog from 'components/questions/BuzzerQuestionDialog.vue';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import CountDown from 'components/CountDown.vue';
import CircleTimer from 'components/CircleTimer.vue';
import { useAppSettingsStore } from 'stores/application-settings-store';
import { storeToRefs } from 'pinia';
import PulseCircle from 'components/PulseCircle.vue';

interface Size {
  width: number;
  height: number;
}

const quasar = useQuasar();
const { buzzerSettings } = useQuestionSettingsStore();
const appSettingsStore = useAppSettingsStore();
const { controllers, buzzer } = useBuzzer();

const controllerNameStyle = ref<string | { fontSize: string }>('');
const countDownStyle = ref<string | { fontSize: string }>('');
const circleSize = ref<Size>();
const pressedController = ref<IController>();
const started = ref<boolean>(false);
const pressedControllers = ref<string[]>([]);
const countDownTime = ref<number>(0);
const { muted: globalMuted } = storeToRefs(appSettingsStore);

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
  return buzzerSettings.playSounds && !globalMuted.value;
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

const pulse = computed<boolean>(() => {
  return !pressedController.value && started.value;
});

const allControllersPressed = computed<boolean>(() => {
  return !controllers.value.some(
    (controller) => !pressedControllers.value.includes(controller.id),
  );
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
