<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column no-wrap">
      <!-- Content -->
      <div class="col-grow row justify-center no-wrap">
        <template v-if="gameState.name === 'completed'">
          <quiz-ordering-result
            v-if="gameState.mode === 'ordering'"
            :state="gameState"
            :controller-names="controllerNames"
            data-testid="ordering-result"
          />
          <quiz-result-table
            v-else-if="quizSettings.presentationView === 'table'"
            :answers="gameState.result"
            :controller-names="controllerNames"
            data-testid="result"
          />
          <quiz-result-bar-chart
            v-else-if="quizSettings.presentationView === 'bar-chart'"
            :answers="gameState.result"
            :total-answers="gameState.controllers.length"
            data-testid="result"
          />
        </template>
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
            <div
              v-if="
                gameState.name === 'running' && gameState.mode === 'ordering'
              "
              class="q-mt-md"
            >
              {{ t('gameMode.quiz.ordering.redResets') }}
            </div>
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
            <quiz-ordering-buttons
              v-if="gameState.mode === 'ordering'"
              :correct="gameState.correct"
              @update="onOrderingCorrectUpdate"
            />
            <quiz-leaderboard-buttons
              v-else
              :answers="gameState.result"
              @update="onPointsUpdate"
            />

            <q-separator />

            <q-btn
              v-if="gameState.mode === 'elimination'"
              :label="t('gameMode.quiz.action.nextRound')"
              icon="fast_forward"
              color="primary"
              class="self-center"
              rounded
              :disable="disableNextRoundButton"
              data-testid="btn-game-next-round"
              @click="nextRound()"
            />
            <q-btn
              v-else
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
  <quiz-result-mode-toggle
    v-if="gameState.name === 'completed' && gameState.mode !== 'ordering'"
  />
</template>

<script lang="ts" setup>
import TimerAnimated from 'components/TimerAnimated.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import QuizSettingsDialog from 'components/gameModes/quiz/QuizSettingsDialog.vue';
import QuizLeaderboardButtons from 'components/gameModes/quiz/QuizLeaderboardButtons.vue';
import QuizResultModeToggle from 'components/gameModes/quiz/QuizResultModeToggle.vue';
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useBuzzer } from 'src/plugins/buzzer';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { type ButtonEvent, BuzzerButton } from 'src/plugins/buzzer/types';
import TransitionFade from 'components/TransitionFade.vue';
import { buzzerButtonColor } from 'components/buttonColors';
import { useI18n } from 'vue-i18n';
import type {
  QuizRunningChangeAlwaysState,
  QuizRunningChangeConfirmState,
  QuizRunningChangeNeverState,
  QuizRunningState,
  QuizRunningStateBase,
  QuizOrderingRunningState,
  QuizState,
} from 'app/common/gameState/QuizState';
import { useGameState } from 'src/composables/gameState';
import { useTimer } from 'src/composables/timer';
import AudioBeep from 'components/AudioBeep.vue';
import QuizResultTable from 'components/gameModes/quiz/QuizResultTable.vue';
import QuizResultBarChart from 'components/gameModes/quiz/QuizResultBarChart.vue';
import { storeToRefs } from 'pinia';
import QuizOrderingButtons from 'components/gameModes/quiz/QuizOrderingButtons.vue';
import QuizOrderingResult from 'components/gameModes/quiz/QuizOrderingResult.vue';
import { useLeaderboardStore } from 'stores/leaderboard-store';

const { t } = useI18n();
const quasar = useQuasar();
const quizSettingsStore = useGameSettingsStore();
const leaderboardStore = useLeaderboardStore();
const { quizSettings } = storeToRefs(quizSettingsStore);
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

onBeforeMount(async () => {
  await buzzer.reset();
  buzzer.on('press', listener);
});

onUnmounted(async () => {
  buzzer.removeListener('press', listener);
  await buzzer.reset();
});

const tick = transition('running', (state, time: number) => {
  if (time <= 0) {
    if (state.mode === 'ordering') {
      return {
        game: 'quiz',
        name: 'completed',
        controllers: state.controllers,
        result: state.result,
        mode: state.mode,
      };
    }

    return {
      game: 'quiz',
      name: 'completed',
      controllers: state.controllers,
      result: state.result,
      mode: state.mode,
    };
  }

  return {
    ...state,
    time,
  };
});
watch(time, tick);

onStateEntry('preparing', async () => {
  await buzzer.reset();
});

onStateEntry('running', (state) => {
  time.value = state.time;
  startTimer();
});
onStateExit('running', () => {
  stopTimer();
  stopControllerBlink();
});

const controllerNames = computed<Record<string, string>>(() => {
  return controllers.value.reduce(
    (acc, controller) => {
      acc[controller.id] = controller.name;
      return acc;
    },
    {} as Record<string, string>,
  );
});

const disableNextRoundButton = computed<boolean>(() => {
  const state = gameState.value;
  if (state.name !== 'completed') {
    return true;
  }

  if (state.mode !== 'elimination') {
    return true;
  }

  if (state.correct === undefined) {
    return true;
  }

  const correctAnswers = Object.entries(state.result).filter(([, button]) =>
    state.correct?.includes(button),
  ).length;

  return correctAnswers < 2;
});

// Order of buttons
const buttons: BuzzerButton[] = [
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];

const buttonColorClass = (button: BuzzerButton) => {
  return quizSettings.value.activeButtons?.includes(button)
    ? buzzerButtonColor[button]
    : 'grey';
};

const listener = transition('running', (state, event: ButtonEvent) => {
  if (!state.controllers.includes(event.controller.id)) {
    return;
  }

  if (state.mode === 'ordering') {
    return buttonPressedOrdering(event, state);
  }

  switch (state.answerChangeAllowed) {
    case 'always':
      return buttonPressedAnswerChangeAlways(event, state);
    case 'never':
      return buttonPressedAnswerChangeNever(event, state);
    case 'confirm':
      return buttonPressedAnswerChangeConfirm(event, state);
  }
});

const buttonPressedOrdering = (
  event: ButtonEvent,
  state: QuizOrderingRunningState,
): QuizState | undefined => {
  const controllerId = event.controller.id;
  const previousAnswers = state.result[controllerId] ?? [];

  if (previousAnswers.length >= quizSettings.value.activeButtons.length) {
    return;
  }

  if (event.button === BuzzerButton.RED) {
    const result = { ...state.result };
    delete result[controllerId];
    return {
      ...state,
      result,
    };
  }

  if (!quizSettings.value.activeButtons.includes(event.button)) {
    return;
  }

  if (previousAnswers.includes(event.button)) {
    return;
  }

  const answer = [...previousAnswers, event.button];
  const result = {
    ...state.result,
    [controllerId]: answer,
  };
  const answerComplete =
    answer.length >= quizSettings.value.activeButtons.length;

  if (answerComplete) {
    event.controller.setLight(true);
  }

  const completedAnswers = Object.values(result).filter(
    (value) => value.length >= quizSettings.value.activeButtons.length,
  ).length;
  if (completedAnswers >= state.controllers.length) {
    return {
      game: 'quiz',
      name: 'completed',
      mode: 'ordering',
      controllers: state.controllers,
      result,
    };
  }

  return {
    ...state,
    result,
  };
};

const buttonPressedAnswerChangeAlways = (
  event: ButtonEvent,
  state: QuizRunningChangeAlwaysState,
): QuizState | undefined => {
  if (!quizSettings.value.activeButtons.includes(event.button)) {
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
    mode: state.mode,
    controllers: state.controllers,
    time: state.time,
    result,
  };
};

const buttonPressedAnswerChangeNever = (
  event: ButtonEvent,
  state: QuizRunningChangeNeverState,
): QuizState | undefined => {
  if (!quizSettings.value.activeButtons.includes(event.button)) {
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
  if (Object.keys(result).length >= state.controllers.length) {
    return {
      game: 'quiz',
      name: 'completed',
      mode: state.mode,
      controllers: state.controllers,
      result,
    };
  }

  return {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'never',
    controllers: state.controllers,
    mode: state.mode,
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
    if (!quizSettings.value.activeButtons.includes(event.button)) {
      return;
    }

    // Update state
    return {
      game: 'quiz',
      name: 'running',
      answerChangeAllowed: 'confirm',
      controllers: state.controllers,
      mode: state.mode,
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

  // Extract precious pressed button and unconfirmed list
  const { [event.controller.id]: button, ...unconfirmed } = state.unconfirmed;
  if (button === undefined) {
    return;
  }

  // Selection confirmed
  event.controller.setLight(true);

  const result = {
    ...state.result,
    [event.controller.id]: button,
  };

  // Transition to completed if all controllers confirmed
  if (Object.keys(result).length >= state.controllers.length) {
    return {
      game: 'quiz',
      name: 'completed',
      mode: state.mode,
      controllers: state.controllers,
      result,
    };
  }

  return {
    game: 'quiz',
    name: 'running',
    answerChangeAllowed: 'confirm',
    controllers: state.controllers,
    mode: state.mode,
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

const startGame = (
  controllerIds: string[],
): QuizRunningState | QuizOrderingRunningState => {
  const answerChangeAllowed = quizSettings.value.changeMode;
  const time = quizSettings.value.answerTime;
  const mode = quizSettings.value.mode;

  if (mode === 'ordering') {
    return {
      game: 'quiz',
      name: 'running',
      time,
      mode,
      controllers: controllerIds,
      result: {},
    };
  }

  const nextState: QuizRunningStateBase = {
    game: 'quiz',
    name: 'running',
    time,
    mode,
    controllers: controllerIds,
  };

  if (answerChangeAllowed === 'confirm') {
    return {
      ...nextState,
      answerChangeAllowed,
      unconfirmed: {},
      result: {},
    };
  }

  return {
    answerChangeAllowed,
    ...nextState,
    result: {},
  };
};

const start = transition('preparing', () => {
  const availableControllers = controllers.value.map(
    (controller) => controller.id,
  );

  return startGame(availableControllers);
});

const nextRound = transition('completed', (state) => {
  if (state.mode === 'ordering') {
    return;
  }
  if (state.correct === undefined) {
    return;
  }

  const correctControllerIds = Object.entries(state.result)
    .filter(([, button]) => state.correct?.includes(button))
    .map(([controllerId]) => controllerId);

  blinkControllers(correctControllerIds);

  return startGame(correctControllerIds);
});

const restart = transition(['running', 'completed'], () => {
  return {
    game: 'quiz',
    name: 'preparing',
  };
});

const onPointsUpdate = transition(
  'completed',
  (state, correct: BuzzerButton[] | undefined): QuizState => {
    if (state.mode === 'ordering') {
      return state;
    }
    return {
      game: 'quiz',
      name: 'completed',
      result: state.result,
      mode: state.mode,
      controllers: state.controllers,
      correct,
    };
  },
);

const onOrderingCorrectUpdate = transition(
  'completed',
  (state, correct: BuzzerButton[] | undefined): QuizState => {
    if (state.mode !== 'ordering') {
      return state;
    }

    const previousCorrect = state.correct;
    if (previousCorrect) {
      Object.entries(state.result).forEach(([controllerId, answer]) => {
        leaderboardStore.addPoints(
          controllerId,
          -orderingPoints(answer, previousCorrect),
        );
      });
    }

    if (correct) {
      Object.entries(state.result).forEach(([controllerId, answer]) => {
        leaderboardStore.addPoints(
          controllerId,
          orderingPoints(answer, correct),
        );
      });
    }

    return {
      ...state,
      correct,
    };
  },
);

const orderingPoints = (
  answer: BuzzerButton[],
  correct: BuzzerButton[],
): number => {
  const isCorrect =
    answer.length === correct.length &&
    answer.every((button, index) => button === correct[index]);

  return isCorrect
    ? quizSettings.value.pointsCorrect
    : quizSettings.value.pointsWrong;
};

const quickPlay = () => {
  restart();
  start();
};

let controllerBlinkIntervalId: NodeJS.Timeout | undefined;
const blinkControllers = (controllerIds: string[]) => {
  stopControllerBlink();
  let toggle = true;
  controllerBlinkIntervalId = setInterval(() => {
    controllers.value
      .filter((controller) => controllerIds.includes(controller.id))
      .forEach((controller) => controller.setLight(toggle));

    toggle = !toggle;
  }, 1000);
};

const stopControllerBlink = () => {
  if (controllerBlinkIntervalId) {
    clearInterval(controllerBlinkIntervalId);
    controllerBlinkIntervalId = undefined;
  }
};
</script>

<style scoped></style>
