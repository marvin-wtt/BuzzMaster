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
          <template v-if="gameState.name === 'answering'">
            <audio-beep
              :time="gameState.time"
              :start-at="buzzerSettings.countDownBeepStartAt"
              :silent="!buzzerSettings.playSounds"
            />

            <circle-timer
              :time="gameState.time"
              :max="buzzerSettings.answerTime"
            >
              <text-dynamic
                :name="findControllerById(gameState.controller).name"
              >
                <timer-animated
                  v-if="buzzerSettings.answerTime > 0"
                  :time="gameState.time"
                  animated
                />
              </text-dynamic>
            </circle-timer>
          </template>
          <template v-else-if="gameState.name === 'answered'">
            <circle-timer
              :time="0"
              :max="buzzerSettings.answerTime"
            >
              <text-dynamic
                :name="findControllerById(gameState.controller).name"
              />
            </circle-timer>
          </template>
          <!-- Waiting -->
          <pulse-circle
            v-else
            class="column justify-center q-col-gutter-sm text-h5"
            :pulse="gameState.name === 'running'"
          >
            <div v-if="gameState.name === 'preparing'">
              {{
                t('gameMode.buzzer.controllersReady', {
                  count: controllers.length,
                })
              }}
            </div>
            <div v-else>
              {{ t('gameMode.buzzer.waitingForBuzzer') }}
            </div>
          </pulse-circle>
        </div>
      </div>
      <!-- Actions -->
      <div class="col-5 row justify-center no-wrap">
        <!-- Start menu -->
        <div
          v-if="gameState.name === 'preparing'"
          class="column q-gutter-sm justify-center"
        >
          <q-btn
            :label="t('gameMode.buzzer.action.start')"
            color="primary"
            rounded
            data-testid="btn-game-start"
            @click="start()"
          />
          <q-btn
            :label="t('gameMode.buzzer.action.settings')"
            outline
            rounded
            data-testid="btn-game-settings"
            @click="settings"
          />
        </div>

        <!-- Result menu -->
        <div
          v-else-if="
            gameState.name === 'answering' || gameState.name === 'answered'
          "
          class="column col-xs-10 col-sm-7 col-md-6 col-lg-4 col-xl-3 justify-center q-col-gutter-y-sm"
        >
          <!-- Leaderboard -->
          <buzzer-leaderboard-buttons
            :controller="findControllerById(gameState.controller)"
            @update="onPointsUpdate"
          />

          <div class="q-pt-md">
            <q-separator />
          </div>

          <!-- First row -->
          <div class="row">
            <div class="col-6 column justify-center content-end">
              <q-btn
                :label="t('gameMode.buzzer.action.reOpen')"
                icon="loop"
                color="primary"
                class="q-mx-sm"
                rounded
                :outline="disableContinue"
                :disable="disableContinue"
                data-testid="btn-game-reopen"
                @click="continueQuestion()"
              />
            </div>
            <div class="col-6 column justify-center content-start">
              <q-btn
                :label="t('gameMode.buzzer.action.quickPlay')"
                icon="fast_forward"
                color="primary"
                class="q-mx-sm"
                rounded
                data-testid="btn-game-quick-play"
                @click="quickPlay()"
              />
            </div>
          </div>
          <!-- Second row -->
          <div class="row justify-center">
            <q-btn
              :label="t('gameMode.buzzer.action.reset')"
              icon="replay"
              outline
              rounded
              data-testid="btn-game-restart"
              @click="restart()"
            />
          </div>
        </div>

        <div
          v-else-if="gameState.name === 'running'"
          class="row justify-center"
        >
          <div class="column justify-center">
            <q-btn
              :label="t('gameMode.buzzer.action.cancel')"
              outline
              rounded
              data-testid="btn-game-cancel"
              @click="restart()"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import BuzzerLeaderboardButtons from 'components/gameModes/buzzer/BuzzerLeaderboardButtons.vue';
import BuzzerSettingsDialog from 'components/gameModes/buzzer/BuzzerSettingsDialog.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useQuasar } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { useGameState } from 'src/composables/gameState';
import TimerAnimated from 'components/TimerAnimated.vue';
import { useTimer } from 'src/composables/timer';
import AudioBeep from 'components/AudioBeep.vue';
import TextDynamic from 'components/TextDynamic.vue';

const quasar = useQuasar();
const { t } = useI18n();
const { buzzerSettings } = useGameSettingsStore();
const { controllers, buzzer } = useBuzzer();
const { time, stopTimer, startTimer } = useTimer({
  updateRate: 100,
  direction: 'down',
});
const { gameState, transition, onStateEntry, onStateExit } =
  useGameState<BuzzerState>({
    game: 'buzzer',
    name: 'preparing',
  });

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

const disableContinue = computed<boolean>(() => {
  if (gameState.value.name === 'answered' && gameState.value.correct) {
    return true;
  }

  if (
    gameState.value.name !== 'answering' &&
    gameState.value.name !== 'answered'
  ) {
    return false;
  }

  const pressedControllers = gameState.value.pressedControllers;

  return !controllers.value.some(
    (controller) => !pressedControllers.includes(controller.id),
  );
});

const listener = transition('running', (state, event: ButtonEvent) => {
  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (
    !buzzerSettings.multipleAttempts &&
    state.pressedControllers.includes(event.controller.id)
  ) {
    return;
  }

  event.controller.setLight(true);

  if (buzzerSettings.playSounds) {
    audio.play();
  }

  const pressedControllers = [...state.pressedControllers];
  if (!state.pressedControllers.includes(event.controller.id)) {
    pressedControllers.push(event.controller.id);
  }

  return {
    game: 'buzzer',
    name: 'answering',
    time: buzzerSettings.answerTime,
    controller: event.controller.id,
    pressedControllers,
  };
});

const tick = transition('answering', (state, time: number) => {
  if (time <= 0) {
    stopTimer();
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

onStateEntry('answering', (state) => {
  time.value = state.time;
  startTimer();
});
onStateExit('answering', () => {
  stopTimer();
  buzzer.reset();
});

const onPointsUpdate = transition(
  ['answering', 'answered'],
  (state, correct: boolean | undefined, points: number | undefined) => {
    if (correct !== undefined && points !== undefined) {
      return {
        game: 'buzzer',
        name: 'answered',
        controller: state.controller,
        pressedControllers: state.pressedControllers,
        correct,
        points,
      };
    }

    return {
      game: 'buzzer',
      name: 'answering',
      controller: state.controller,
      pressedControllers: state.pressedControllers,
      time: 0,
    };
  },
);

const continueQuestion = transition(['answering', 'answered'], (state) => {
  return {
    game: 'buzzer',
    name: 'running',
    pressedControllers: state.pressedControllers,
  };
});

const restart = transition(['running', 'answering', 'answered'], () => {
  return {
    game: 'buzzer',
    name: 'preparing',
  };
});

const quickPlay = () => {
  restart();
  start();
};

const start = transition('preparing', () => {
  return {
    game: 'buzzer',
    name: 'running',
    pressedControllers: [],
  };
});

const settings = () => {
  quasar.dialog({
    component: BuzzerSettingsDialog,
  });
};

const findControllerById = (id: string): IController => {
  const controller = controllers.value.find(
    (controller) => controller.id === id,
  );

  if (!controller) {
    throw new Error('Cannot find controller with id ' + id);
  }

  return controller;
};
</script>

<style scoped></style>
