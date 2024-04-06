<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column no-wrap">
      <!-- Content -->
      <div class="col-grow row justify-center no-wrap">
        <quiz-result
          v-if="gameState.name === 'completed'"
          :controllers-by-button="controllersByButton"
        />
        <div
          v-else
          class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center justify-center"
        >
          <transition-fade>
            <!-- Start -->
            <pulse-circle
              v-if="gameState.name === 'preparing'"
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
              v-if="gameState.name === 'running' || keepCountDown"
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
                @stop="onCountdownStop"
              />
            </circle-timer>
          </transition-fade>
        </div>
      </div>
      <!-- Actions -->
      <div class="col-3 row justify-center">
        <transition-fade>
          <div
            v-if="gameState.name === 'preparing'"
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
            v-if="gameState.name === 'completed'"
            class="column col-xs-10 col-sm-7 col-md-6 col-lg-4 col-xl-3 q-gutter-y-sm"
          >
            <quiz-scoreboard-buttons
              v-if="showScoreboardActions"
              :controller-values="controllersByButton"
            />

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

          <div v-if="gameState.name === 'running'">
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
  </q-page>

  <!-- Actions -->
  <quiz-result-mode-toggle v-if="gameState.name === 'completed'" />
</template>

<script lang="ts" setup>
import CountDown from 'components/CountDown.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import QuizQuestionDialog from 'components/questions/quiz/QuizQuestionDialog.vue';
import QuizResult from 'components/questions/quiz/QuizResult.vue';
import QuizScoreboardButtons from 'components/questions/quiz/QuizScoreboardButtons.vue';
import QuizResultModeToggle from 'components/questions/quiz/QuizResultModeToggle.vue';
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
import {
  QuizRunningChangeAlwaysState,
  QuizRunningChangeConfirmState,
  QuizRunningChangeNeverState,
  QuizState,
} from 'app/common/GameState';
import { buzzerButtonColor } from 'components/buttonColors';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const quasar = useQuasar();
const { quizSettings } = useQuestionSettingsStore();
const { controllers, buzzer } = useBuzzer();

const gameState = ref<QuizState>({
  game: 'quiz',
  name: 'preparing',
});

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});

const controllersByButton = computed<
  Record<BuzzerButton, IController[] | undefined>
>(() => {
  const state = gameState.value;
  if (state.name !== 'completed') {
    return {} as Record<BuzzerButton, IController[] | undefined>;
  }

  return controllers.value.reduce(
    (acc, controller) => {
      // Mo input is default button
      const pressedButton =
        controller.id in state.result ? state.result[controller.id] : undefined;
      // Ignore input if user has not confirmed the button selection
      const button = pressedButton ?? BuzzerButton.RED;

      acc[button] ??= [];
      acc[button].push(controller);

      return acc;
    },
    {} as Record<BuzzerButton, IController[]>,
  );
});

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

const onComplete = () => {
  if (gameState.value.name !== 'running') {
    return;
  }

  gameState.value = {
    game: 'quiz',
    name: 'completed',
    result: gameState.value.result,
  };
};

const buttonPressedAnswerChangeAlways = (
  event: ButtonEvent,
  state: QuizRunningChangeAlwaysState,
) => {
  if (!quizSettings.activeButtons.includes(event.button)) {
    return;
  }

  gameState.value = {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'always',
    time: state.time,
    result: {
      ...state.result,
      [event.controller.id]: event.button,
    },
  };
};

const buttonPressedAnswerChangeNever = (
  event: ButtonEvent,
  state: QuizRunningChangeNeverState,
) => {
  if (!quizSettings.activeButtons.includes(event.button)) {
    return;
  }

  // Guard already answered
  if (event.controller.id in state.result) {
    return;
  }

  // Update state
  gameState.value = {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'never',
    time: state.time,
    result: {
      ...state.result,
      [event.controller.id]: event.button,
    },
  };

  // Update controller
  event.controller.setLight(true);

  // Transition to completed if all controllers answered
  if (Object.keys(state.result).length + 1 >= controllers.value.length) {
    onComplete();
  }
};

const buttonPressedAnswerChangeConfirm = (
  event: ButtonEvent,
  state: QuizRunningChangeConfirmState,
) => {
  // Guard already confirmed
  if (event.controller.id in state.result) {
    return;
  }

  // Change answer
  if (event.button !== BuzzerButton.RED) {
    if (!quizSettings.activeButtons.includes(event.button)) {
      return;
    }

    // Update state
    gameState.value = {
      game: 'quiz',
      name: 'running',
      answerChangeAllowed: 'confirm',
      time: state.time,
      result: state.result,
      unconfirmed: {
        ...state.unconfirmed,
        [event.controller.id]: event.button,
      },
    };
    return;
  }

  // Don't allow confirmation without answer
  if (!(event.controller.id in state.unconfirmed)) {
    return;
  }

  // Extract precious pressed button and unconfirmed list
  const { [event.controller.id]: button, ...unconfirmed } = state.unconfirmed;

  // Update state
  gameState.value = {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'confirm',
    time: state.time,
    result: {
      ...state.result,
      [event.controller.id]: button,
    },
    unconfirmed,
  };

  event.controller.setLight(true);

  // Transition to completed if all controllers confirmed
  if (Object.keys(gameState.value.result).length >= controllers.value.length) {
    onComplete();
  }
};

const listener = (event: ButtonEvent) => {
  if (gameState.value.name !== 'running') {
    return;
  }

  if (gameState.value.answerChangeAllowed === 'confirm') {
    return buttonPressedAnswerChangeConfirm(event, gameState.value);
  }
  if (gameState.value.answerChangeAllowed === 'never') {
    return buttonPressedAnswerChangeNever(event, gameState.value);
  }

  buttonPressedAnswerChangeAlways(event, gameState.value);
};

const onCountdownStop = () => {
  onComplete();
};

const soundsEnabled = computed<boolean>(() => {
  return quizSettings.playSounds;
});

const openSettings = () => {
  quasar.dialog({
    component: QuizQuestionDialog,
  });
};

const start = () => {
  if (gameState.value.name !== 'preparing') {
    return;
  }

  if (quizSettings.changeMode === 'confirm') {
    gameState.value = {
      game: 'quiz',
      name: 'running',
      time: quizSettings.answerTime,
      answerChangeAllowed: 'confirm',
      result: {},
      unconfirmed: {},
    };
  } else {
    gameState.value = {
      game: 'quiz',
      name: 'running',
      time: quizSettings.answerTime,
      answerChangeAllowed: quizSettings.changeMode,
      result: {},
    };
  }
};

const restart = () => {
  buzzer.reset();

  gameState.value = {
    game: 'quiz',
    name: 'preparing',
  };
};

const quickPlay = () => {
  restart();
  start();
};

const buttonColorClass = (button: BuzzerButton) => {
  return quizSettings.activeButtons?.includes(button)
    ? buzzerButtonColor[button]
    : 'grey';
};

// Workaround to keep the countdown alive and wait for the last beep to finish
const countDownTime = computed<number>({
  get() {
    return gameState.value.name === 'running' ? gameState.value.time : 0;
  },
  set(value: number) {
    if (gameState.value.name === 'running') {
      gameState.value.time = value;
    }
  },
});
const keepCountDown = ref<boolean>(false);
let keepCountDownTimeout: NodeJS.Timeout | undefined = undefined;
watch(gameState, (value, oldValue) => {
  // Only capture transitions from running to completed
  if (oldValue.name !== 'running' || value.name !== 'completed') {
    clearTimeout(keepCountDownTimeout);
    keepCountDown.value = false;

    return;
  }

  if (oldValue.time > 0) {
    keepCountDown.value = false;
    return;
  }

  keepCountDown.value = true;
  keepCountDownTimeout = setTimeout(() => {
    keepCountDown.value = false;
  }, 1000);
});
</script>

<style scoped></style>
