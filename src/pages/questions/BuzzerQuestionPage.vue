<template>
  <navigation-bar
    title="Buzzer Question"
    padding
  >
    <div class="col-12 column justify-around">
      <!-- Content -->
      <div class="col-grow row justify-center">
        <div class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center justify-center">
          <!-- Result -->
          <circle-timer
            v-if="started && pressedController"
            v-model="countDownTIme"
            :max="buzzerSettings.answerTime"
          >
            <div class="column justify-center q-col-gutter-sm">
              <a class="text-h4">{{ pressedController.name }}</a>
              <count-down
                v-if="buzzerSettings.answerTime > 0"
                v-model="countDownTIme"
                class="text-h5"
                :beep="buzzerSettings.playSounds"
                :beep-start-time="buzzerSettings.countDownBeepStartAt"
              />
            </div>
          </circle-timer>
          <!-- Waiting -->
          <div
            v-else
            class="column justify-center q-col-gutter-sm text-h5 circle"
            :class="pulseClass"
          >
            <div v-if="!started">
              {{ controllers.length + ' controllers ready!' }}
            </div>
            <div v-else>Waiting for buzzer...</div>
          </div>
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
              color="negative"
              rounded
              :outline="allControllersPressed"
              :disable="allControllersPressed"
              @click="continueQuestion()"
            />
            <q-btn
              label="Quick Play"
              icon="fast_forward"
              color="positive"
              rounded
              @click="quickPlay()"
            />
          </div>
          <!-- Second row -->
          <div class="row justify-center q-mt-md">
            <q-btn
              label="Reset"
              icon="replay"
              color="primary"
              rounded
              @click="restart()"
            />
          </div>
        </div>

        <div v-if="started == !pressedController">
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
import { computed, onBeforeMount, onUnmounted, ref } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonPressEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useQuasar } from 'quasar';
import BuzzerQuestionDialog from 'components/questions/BuzzerQuestionDialog.vue';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import CountDown from 'components/CountDown.vue';
import CircleTimer from 'components/CircleTimer.vue';

const quasar = useQuasar();
const { buzzerSettings } = useQuestionSettingsStore();
const { controllers, reset, onButtonPressed, removeListener } = useBuzzer();

const pressedController = ref<IController>();
const started = ref<boolean>(false);
const pressedControllers = ref<string[]>([]);
const countDownTIme = ref<number>(0);

const audio = new Audio('sounds/buzzer.mp3');

onBeforeMount(() => {
  reset();
  onButtonPressed(listener);

  audio.load();
});

onUnmounted(() => {
  removeListener('press', listener);
});

const pulseClass = computed<string>(() => {
  if (pressedController.value) {
    return '';
  }

  if (started.value) {
    return 'pulse';
  }

  return '';
});

const allControllersPressed = computed<boolean>(() => {
  return !controllers.value.some(
    (controller) => !pressedControllers.value.includes(controller.id)
  );
});

const listener = (event: ButtonPressEvent) => {
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

  if (buzzerSettings.playSounds) {
    audio.play();
  }

  countDownTIme.value = buzzerSettings.answerTime;
  pressedController.value = event.controller;
  pressedControllers.value.push(event.controller.id);

  event.controller.setLight(true);
};

const continueQuestion = () => {
  reset();

  pressedController.value = undefined;
};

const restart = () => {
  reset();

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

<style lang="scss" scoped>
$pulseMin: 0.95;
$pulseMax: 1;

.circle {
  border-radius: 50%;
  aspect-ratio: 1 / 1;

  box-shadow: 0 0 0 1px;
}

.pulse {
  animation: t-pulse 2s infinite;
}

.pulse * {
  animation: pulse-inverse 2s infinite;
}

@keyframes pulse-inverse {
  0% {
    transform: scale(1 / $pulseMin);
  }

  70% {
    transform: scale(1 / $pulseMax);
  }

  100% {
    transform: scale(1 / $pulseMin);
  }
}

@keyframes t-pulse {
  0% {
    transform: scale($pulseMin);
    box-shadow: 0 0 0 0;
  }

  70% {
    transform: scale($pulseMax);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale($pulseMin);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
