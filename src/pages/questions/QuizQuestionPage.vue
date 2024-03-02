<template>
  <navigation-bar
    title="Quiz"
    padding
  >
    <div class="col-12 column justify-around no-wrap">
      <!-- Content -->
      <div class="col-grow row justify-center">
        <div
          v-if="completed"
          class="column q-mb-sm"
        >
          <quiz-result
            v-model="activeResult"
            :confirmed-controllers="confirmedControllers"
            :pressed-buttons="pressedButtons"
          />
        </div>

        <div
          v-else
          class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center justify-center"
        >
          <transition-fade>
            <!-- Start -->
            <pulse-circle
              v-if="!started"
              :pulse="false"
              class="column justify-center q-col-gutter-sm text-h5"
            >
              <div>
                {{ controllers.length + ' controllers ready!' }}
              </div>
              <div>
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.BLUE)
                      ? 'blue'
                      : 'grey'
                  "
                />
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.ORANGE)
                      ? 'orange'
                      : 'grey'
                  "
                />
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.GREEN)
                      ? 'green'
                      : 'grey'
                  "
                />
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.YELLOW)
                      ? 'yellow'
                      : 'grey'
                  "
                />
              </div>
            </pulse-circle>

            <!-- Waiting for answers -->
            <circle-timer
              v-else-if="!completed"
              v-model="countDownTime"
              :max="quizSettings.answerTime"
            >
              <count-down
                v-if="quizSettings.answerTime > 0"
                v-model="countDownTime"
                :beep="soundsEnabled"
                :beep-start-time="quizSettings.countDownBeepStartAt"
                animated
                class="text-h2"
              />
            </circle-timer>
          </transition-fade>
        </div>
      </div>
      <!-- Actions -->
      <div class="col-2 column content-center">
        <transition-fade>
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
              @click="openSettings"
            />
          </div>

          <div
            class="column q-gutter-sm"
            v-if="done && completed"
          >
            <q-btn
              label="Quick Play"
              icon="fast_forward"
              color="primary"
              rounded
              @click="quickPlay()"
            />
            <q-btn
              label="Reset"
              icon="replay"
              outline
              rounded
              @click="restart()"
            />
          </div>

          <div v-if="started && !done">
            <q-btn
              label="Cancel"
              outline
              rounded
              @click="restart()"
            />
          </div>
        </transition-fade>
      </div>
    </div>
  </navigation-bar>
</template>

<script lang="ts" setup>
import CountDown from 'components/CountDown.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import NavigationBar from 'components/PageNavigation.vue';
import QuizQuestionDialog from 'components/questions/quiz/QuizQuestionDialog.vue';
import QuizResult from 'components/questions/quiz/QuizResult.vue';
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useBuzzer } from 'src/plugins/buzzer';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import {
  ButtonPressEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useAppSettingsStore } from 'stores/application-settings-store';
import { storeToRefs } from 'pinia';
import TransitionFade from 'components/TransitionFade.vue';

const quasar = useQuasar();
const { quizSettings } = useQuestionSettingsStore();
const appSettingsStore = useAppSettingsStore();
const { controllers, reset, on, removeListener } = useBuzzer();

const { muted: globalMuted } = storeToRefs(appSettingsStore);
const started = ref<boolean>(false);
const countDownTime = ref<number>(0);
const completed = ref<boolean>(false);
const activeResult = ref<BuzzerButton>();
const pressedButtons = ref<Map<string, BuzzerButton>>(
  new Map<string, BuzzerButton>()
);

onBeforeMount(() => {
  reset();

  on('press', listener);
});

onUnmounted(() => {
  removeListener('press', listener);
  reset();
});

const confirmedControllers = ref<string[]>([]);
const listener = (event: ButtonPressEvent) => {
  if (!started.value || completed.value) {
    return;
  }

  if (confirmedControllers.value.includes(event.controller.id)) {
    return;
  }

  if (event.button === BuzzerButton.RED) {
    if (quizSettings.changeMode !== 'confirm') {
      return;
    }

    if (!pressedButtons.value.has(event.controller.id)) {
      return;
    }

    confirmButton(event.controller);
    return;
  }

  if (!quizSettings.activeButtons.includes(event.button)) {
    return;
  }

  pressedButtons.value.set(event.controller.id, event.button);

  if (quizSettings.changeMode === 'never') {
    confirmButton(event.controller);
  }
};

const confirmButton = (controller: IController) => {
  confirmedControllers.value.push(controller.id);
  controller.setLight(true);
};

const done = computed<boolean>(() => {
  if (!started.value) {
    return false;
  }

  if (countDownTime.value <= 0) {
    return true;
  }

  if (
    (quizSettings.changeMode === 'confirm' ||
      quizSettings.changeMode === 'never') &&
    controllers.value.length === confirmedControllers.value.length
  ) {
    return true;
  }

  return false;
});

let showTimeoutId: NodeJS.Timeout | undefined;
watch(done, (val) => {
  clearTimeout(showTimeoutId);

  if (val) {
    if (countDownTime.value <= 0) {
      setTimeout(() => {
        completed.value = true;
      }, 1000);
    } else {
      completed.value = true;
    }
  } else {
    completed.value = false;
  }
});

const soundsEnabled = computed<boolean>(() => {
  return quizSettings.playSounds && !globalMuted.value;
});

const openSettings = () => {
  quasar.dialog({
    component: QuizQuestionDialog,
  });
};

const start = () => {
  countDownTime.value = quizSettings.answerTime;
  started.value = true;
};

const restart = () => {
  pressedButtons.value = new Map<string, BuzzerButton>();
  confirmedControllers.value = [];
  activeResult.value = undefined;
  reset();

  started.value = false;
};

const quickPlay = () => {
  restart();
  start();
};
</script>

<style scoped></style>
