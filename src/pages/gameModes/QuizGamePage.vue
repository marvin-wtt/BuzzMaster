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
          data-testid="result"
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
              data-testid="preparing-circle"
            >
              <div>
                {{
                  t('gameMode.quiz.controllersReady', {
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
                  data-testid="enabled-controllers-icon"
                />
              </div>
            </pulse-circle>

            <!-- Waiting for answers -->
            <circle-timer
              v-if="gameState.name === 'running'"
              :time="time"
              :max="quizSettings.answerTime"
              data-testid="answer-timer"
            >
              <timer-animated
                :time="time"
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
            v-if="gameState.name === 'preparing'"
            class="column q-gutter-sm"
          >
            <q-btn
              :label="t('gameMode.quiz.action.start')"
              color="primary"
              rounded
              data-testid="btn-game-start"
              @click="start()"
            />
            <q-btn
              :label="t('gameMode.quiz.action.settings')"
              outline
              rounded
              @click="openSettings"
            />
          </div>

          <div
            v-else-if="gameState.name === 'completed'"
            class="column col-xs-10 col-sm-7 col-md-6 col-lg-4 col-xl-3 q-gutter-y-sm"
          >
            <quiz-scoreboard-buttons
              v-if="showScoreboardActions"
              :controller-values="controllersByButton"
            />

            <q-separator />

            <q-btn
              :label="t('gameMode.quiz.action.quickPlay')"
              icon="fast_forward"
              color="primary"
              class="self-center"
              rounded
              data-testid="btn-game-quick-play"
              @click="quickPlay()"
            />
            <q-btn
              :label="t('gameMode.quiz.action.reset')"
              icon="replay"
              class="self-center"
              outline
              rounded
              data-testid="btn-game-restart"
              @click="restart()"
            />
          </div>

          <div v-else-if="gameState.name === 'running'">
            <q-btn
              :label="t('gameMode.quiz.action.cancel')"
              outline
              rounded
              data-testid="btn-game-cancel"
              @click="restart()"
            />
          </div>
        </transition-fade>
      </div>
    </div>

    <audio-beep
      :time="time"
      :start-at="quizSettings.countDownBeepStartAt"
      :silent="!quizSettings.playSounds"
    />
  </q-page>

  <!-- Actions -->
  <quiz-result-mode-toggle v-if="gameState.name === 'completed'" />
</template>

<script lang="ts" setup>
import TimerAnimated from 'components/TimerAnimated.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import QuizSettingsDialog from 'components/gameModes/quiz/QuizSettingsDialog.vue';
import QuizResult from 'components/gameModes/quiz/QuizResult.vue';
import QuizScoreboardButtons from 'components/gameModes/quiz/QuizScoreboardButtons.vue';
import QuizResultModeToggle from 'components/gameModes/quiz/QuizResultModeToggle.vue';
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useBuzzer } from 'src/plugins/buzzer';
import { useGameSettingsStore } from 'stores/game-settings-store';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import TransitionFade from 'components/TransitionFade.vue';
import { buzzerButtonColor } from 'components/buttonColors';
import { useI18n } from 'vue-i18n';
import {
  QuizRunningChangeAlwaysState,
  QuizRunningChangeConfirmState,
  QuizRunningChangeNeverState,
  QuizState,
} from 'app/common/gameState/QuizState';
import { useGameState } from 'src/composables/gameState';
import { useTimer } from 'src/composables/timer';
import AudioBeep from 'components/AudioBeep.vue';

const { t } = useI18n();
const quasar = useQuasar();
const { quizSettings } = useGameSettingsStore();
const { controllers, buzzer } = useBuzzer();
const { time, stopTimer, startTimer } = useTimer({
  updateRate: 100,
  direction: 'down',
});
const { gameState, transition, onStateEntry, onStateExit } =
  useGameState<QuizState>({
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

const tick = transition('running', (state, time: number) => {
  if (time <= 0) {
    return {
      game: 'quiz',
      name: 'completed',
      result: state.result,
    };
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

onStateEntry('running', (state) => {
  time.value = state.time;
  startTimer();
});
onStateExit('running', () => {
  stopTimer();
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

const buttonColorClass = (button: BuzzerButton) => {
  return quizSettings.activeButtons?.includes(button)
    ? buzzerButtonColor[button]
    : 'grey';
};

const listener = transition('running', (state, event: ButtonEvent) => {
  switch (state.answerChangeAllowed) {
    case 'always':
      return buttonPressedAnswerChangeAlways(event, state);
    case 'never':
      return buttonPressedAnswerChangeNever(event, state);
    case 'confirm':
      return buttonPressedAnswerChangeConfirm(event, state);
  }
});

const buttonPressedAnswerChangeAlways = (
  event: ButtonEvent,
  state: QuizRunningChangeAlwaysState,
): QuizState | undefined => {
  if (!quizSettings.activeButtons.includes(event.button)) {
    return;
  }

  const result = {
    ...state.result,
    [event.controller.id]: event.button,
  };

  return {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'always',
    time: state.time,
    result,
  };
};

const buttonPressedAnswerChangeNever = (
  event: ButtonEvent,
  state: QuizRunningChangeNeverState,
): QuizState | undefined => {
  if (!quizSettings.activeButtons.includes(event.button)) {
    return;
  }

  // Guard already answered
  if (event.controller.id in state.result) {
    return;
  }

  // Update controller
  event.controller.setLight(true);

  const result = {
    ...state.result,
    [event.controller.id]: event.button,
  };

  // Transition to completed if all controllers answered
  if (Object.keys(result).length >= controllers.value.length) {
    return {
      game: 'quiz',
      name: 'completed',
      result,
    };
  }

  return {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'never',
    time: state.time,
    result,
  };
};

const buttonPressedAnswerChangeConfirm = (
  event: ButtonEvent,
  state: QuizRunningChangeConfirmState,
): QuizState | undefined => {
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
    return {
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
  }

  // Don't allow confirmation without answer
  if (!(event.controller.id in state.unconfirmed)) {
    return;
  }

  // Selection confirmed
  event.controller.setLight(true);

  // Extract precious pressed button and unconfirmed list
  const { [event.controller.id]: button, ...unconfirmed } = state.unconfirmed;
  const result = {
    ...state.result,
    [event.controller.id]: button,
  };

  // Transition to completed if all controllers confirmed
  if (Object.keys(result).length >= controllers.value.length) {
    return {
      game: 'quiz',
      name: 'completed',
      result,
    };
  }

  return {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'confirm',
    time: state.time,
    result,
    unconfirmed,
  };
};

const openSettings = () => {
  quasar.dialog({
    component: QuizSettingsDialog,
  });
};

const start = transition('preparing', () => {
  if (quizSettings.changeMode === 'confirm') {
    return {
      game: 'quiz',
      name: 'running',
      time: quizSettings.answerTime,
      answerChangeAllowed: 'confirm',
      result: {},
      unconfirmed: {},
    };
  }

  return {
    game: 'quiz',
    name: 'running',
    time: quizSettings.answerTime,
    answerChangeAllowed: quizSettings.changeMode,
    result: {},
  };
});

const restart = transition(['running', 'completed'], () => {
  return {
    game: 'quiz',
    name: 'preparing',
  };
});

const quickPlay = () => {
  restart();
  start();
};
</script>

<style scoped></style>
