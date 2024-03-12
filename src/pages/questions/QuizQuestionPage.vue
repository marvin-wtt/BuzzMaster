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
            :controllers-by-button="controllersByButton"
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
      <div class="col-3 row justify-center">
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
            <div
              v-if="showScoreboardActions"
              class="row q-gutter-sm"
            >
              <q-btn
                v-for="button in quizSettings.activeButtons"
                :key="button"
                :color="buttonColor(button)"
                size="sm"
                round
                class="scoreboard-btm"
                style="border-width: 20px"
                :outline="!correctAnswers.has(button)"
                @click="updateButtonScore(button)"
              />
            </div>

            <q-separator />

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
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useAppSettingsStore } from 'stores/application-settings-store';
import { storeToRefs } from 'pinia';
import TransitionFade from 'components/TransitionFade.vue';
import { useScoreboardStore } from 'stores/scoreboard-store';

const quasar = useQuasar();
const { quizSettings } = useQuestionSettingsStore();
const appSettingsStore = useAppSettingsStore();
const scoreboardStore = useScoreboardStore();
const { controllers, buzzer } = useBuzzer();

const { muted: globalMuted } = storeToRefs(appSettingsStore);
const started = ref<boolean>(false);
const countDownTime = ref<number>(0);
const completed = ref<boolean>(false);
const activeResult = ref<BuzzerButton>();
const pressedButtons = ref<Map<string, BuzzerButton>>(
  new Map<string, BuzzerButton>(),
);
const confirmedControllers = ref<string[]>([]);
const correctAnswers = ref<Set<BuzzerButton>>(new Set());

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});
const listener = (event: ButtonEvent) => {
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

  return (
    (quizSettings.changeMode === 'confirm' ||
      quizSettings.changeMode === 'never') &&
    controllers.value.length === confirmedControllers.value.length
  );
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
  buzzer.reset();

  started.value = false;
};

const quickPlay = () => {
  restart();
  start();
};

const controllersByButton = computed<
  Record<BuzzerButton, IController[] | undefined>
>(() => {
  return controllers.value.reduce(
    (acc, controller) => {
      const hasConfirmed =
        quizSettings.changeMode === 'always' ||
        confirmedControllers.value.includes(controller.id);
      // Mo input is default button
      const pressedButton =
        pressedButtons.value.get(controller.id) ?? BuzzerButton.RED;
      // Ignore input if user has not confirmed the button selection
      const button = hasConfirmed ? pressedButton : BuzzerButton.RED;

      acc[button] ??= [];
      acc[button].push(controller);

      return acc;
    },
    {} as Record<BuzzerButton, IController[]>,
  );
});

const updateButtonScore = (button: BuzzerButton): void => {
  // No button was preciously pressed, so we assume all answers are wrong.
  // Points for correct answers are refunded later
  if (correctAnswers.value.size === 0) {
    confirmedControllers.value.forEach((controllerId) => {
      scoreboardStore.addPoints(controllerId, quizSettings.pointsWrong);
    });
  }

  if (correctAnswers.value.has(button)) {
    // Add wrong point and refund correct points
    controllersByButton.value[button]?.forEach((controller) => {
      scoreboardStore.addPoints(controller.id, quizSettings.pointsCorrect * -1);
      scoreboardStore.addPoints(controller.id, quizSettings.pointsWrong);
    });

    correctAnswers.value.delete(button);
  } else {
    // Add correct point and refund wrong points
    controllersByButton.value[button]?.forEach((controller) => {
      scoreboardStore.addPoints(controller.id, quizSettings.pointsWrong * -1);
      scoreboardStore.addPoints(controller.id, quizSettings.pointsCorrect);
    });

    correctAnswers.value.add(button);
  }

  // If all buzzers are unselected, no points are granted
  if (correctAnswers.value.size === 0) {
    confirmedControllers.value.forEach((controllerId) => {
      scoreboardStore.addPoints(controllerId, quizSettings.pointsWrong * -1);
    });
  }
};

const showScoreboardActions = computed<boolean>(() => {
  return quizSettings.pointsCorrect !== 0 || quizSettings.pointsWrong !== 0;
});

const buttonColor = (button: BuzzerButton): string => {
  switch (button) {
    case BuzzerButton.BLUE:
      return 'blue';
    case BuzzerButton.GREEN:
      return 'green';
    case BuzzerButton.ORANGE:
      return 'orange';
    case BuzzerButton.YELLOW:
      return 'yellow';
    case BuzzerButton.RED:
      return 'red';
  }
};
</script>

<style scoped></style>
