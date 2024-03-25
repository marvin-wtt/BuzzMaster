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
              v-if="state === 'preparing'"
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
            v-if="state === 'preparing'"
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
            v-if="state === 'completed'"
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

          <div v-if="state === 'running'">
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
import QuizScoreboardButtons from 'components/questions/quiz/QuizScoreboardButtons.vue';
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
import { buzzerButtonColor } from 'components/buttonColors';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const quasar = useQuasar();
const { quizSettings } = useQuestionSettingsStore();
const { controllers, buzzer } = useBuzzer();

const state = ref<'preparing' | 'running' | 'completed'>('preparing');
const countDownTime = ref<number>(0);
const showResults = ref<boolean>(false);
const pressedButtons = ref<Map<string, BuzzerButton>>(
  new Map<string, BuzzerButton>(),
);
const confirmedControllers = ref<string[]>([]);

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});
const listener = (event: ButtonEvent) => {
  if (state.value !== 'running') {
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

  // Complete the question if all controllers are confirmed and change is not permitted
  if (
    quizSettings.changeMode !== 'always' &&
    controllers.value.length === confirmedControllers.value.length
  ) {
    state.value = 'completed';
  }
};

const confirmButton = (controller: IController) => {
  confirmedControllers.value.push(controller.id);
  controller.setLight(true);
};

const onCountdownStop = () => {
  state.value = 'completed';
};

watch(state, (value) => {
  // If component leaves too early, timer sound is interrupted
  if (value === 'completed') {
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
  state.value = 'running';
};

const restart = () => {
  pressedButtons.value = new Map<string, BuzzerButton>();
  confirmedControllers.value = [];
  buzzer.reset();

  state.value = 'preparing';
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
