<template>
  <navigation-bar
    :title="t('question.quiz.title')"
    padding
  >
    <div class="col-12 column justify-around no-wrap">
      <!-- Content -->
      <div class="col-grow row justify-center no-wrap">
        <quiz-result
          v-if="showResults"
          v-model="activeResult"
          :confirmed-controllers="confirmedControllers"
          :pressed-buttons="pressedButtons"
          :controllers-by-button="controllersByButton"
        />
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
                {{
                  t('question.quiz.controllersReady', {
                    count: controllers.length,
                  })
                }}
              </div>
              <div>
                <q-icon
                  v-for="button in buttons"
                  :key="button"
                  :color="buttonColorClass(button)"
                  name="circle"
                />
              </div>
            </pulse-circle>

            <!-- Waiting for answers -->
            <circle-timer
              v-else-if="!showResults"
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
              :label="t('question.quiz.action.start')"
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
            v-if="done && showResults"
            class="column col-xs-10 col-sm-7 col-md-6 col-lg-4 col-xl-3 q-gutter-y-sm"
          >
            <div
              v-if="showScoreboardActions"
              class="row justify-center q-gutter-sm"
            >
              <q-btn
                v-for="button in quizSettings.activeButtons"
                :key="button"
                :color="buzzerButtonColor[button]"
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
              :label="t('question.quiz.action.quickPlay')"
              icon="fast_forward"
              color="primary"
              class="self-center"
              rounded
              @click="quickPlay()"
            />
            <q-btn
              :label="t('question.quiz.action.reset')"
              icon="replay"
              class="self-center"
              outline
              rounded
              @click="restart()"
            />
          </div>

          <div v-if="started && !done">
            <q-btn
              :label="t('question.quiz.action.cancel')"
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
import TransitionFade from 'components/TransitionFade.vue';
import { useScoreboardStore } from 'stores/scoreboard-store';
import { buzzerButtonColor } from 'components/buttonColors';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const quasar = useQuasar();
const { quizSettings } = useQuestionSettingsStore();
const scoreboardStore = useScoreboardStore();
const { controllers, buzzer } = useBuzzer();

const started = ref<boolean>(false);
const countDownTime = ref<number>(0);
const showResults = ref<boolean>(false);
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
  if (!started.value || done.value) {
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

watch(done, (val) => {
  if (val) {
    if (countDownTime.value <= 0) {
      setTimeout(() => {
        showResults.value = true;
      }, 1000);
    } else {
      showResults.value = true;
    }
  } else {
    showResults.value = false;
  }
});

const soundsEnabled = computed<boolean>(() => {
  return quizSettings.playSounds;
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

// Order of buttons
const buttons: BuzzerButton[] = [
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];

const buttonColorClass = (button: BuzzerButton) => {
  return quizSettings.activeButtons?.includes(button)
    ? buzzerButtonColor[button]
    : 'grey';
};
</script>

<style scoped></style>
