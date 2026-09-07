<template>
  <q-page class="column no-wrap q-pa-md">
    <!-- Who buzzed in -->
    <div
      v-if="gameState.name === 'answering' || gameState.name === 'answered'"
      class="bm-buzzed"
    >
      <span
        class="bm-buzzed__dot"
        aria-hidden="true"
      />
      <div class="col">
        <div class="bm-section">
          {{ t('gameMode.buzzer.buzzedIn') }}
        </div>
        <div class="bm-buzzed__name">
          {{ findControllerById(gameState.controller).name }}
        </div>
      </div>
    </div>

    <!-- Stage -->
    <div class="col-grow column no-wrap items-center justify-center">
      <!-- Counting down -->
      <template v-if="gameState.name === 'answering'">
        <audio-beep
          :time="gameState.time"
          :start-at="buzzerSettings.countDownBeepStartAt"
          :silent="!buzzerSettings.playSounds"
        />

        <div
          v-if="buzzerSettings.answerTime > 0"
          class="bm-countdown column items-center"
          :class="`bm-countdown--${timeTone}`"
        >
          <div class="bm-clock bm-num">
            <timer-animated
              :time="gameState.time"
              :precision="1"
            />
          </div>

          <div class="bm-clock__track">
            <span :style="{ width: `${remaining * 100}%` }" />
          </div>
        </div>

        <!-- No answer time set: nothing to count down -->
        <q-icon
          v-else
          name="all_inclusive"
          size="72px"
          class="bm-dim"
        />
      </template>

      <!-- Judged -->
      <div
        v-else-if="gameState.name === 'answered'"
        class="column items-center q-gutter-y-xs"
        :class="gameState.correct ? 'text-positive' : 'text-negative'"
      >
        <q-icon
          :name="gameState.correct ? 'check_circle' : 'cancel'"
          size="48px"
        />
        <div class="bm-verdict bm-num">
          {{ n(gameState.points, { signDisplay: 'exceptZero' }) }}
        </div>
        <div class="bm-section">
          {{ t('gameMode.buzzer.points') }}
        </div>
      </div>

      <!-- Waiting -->
      <pulse-circle
        v-else
        class="bm-waiting column justify-center items-center text-center"
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

    <!-- Actions -->
    <div class="bm-actions column q-gutter-y-sm">
      <!-- Start menu -->
      <template v-if="gameState.name === 'preparing'">
        <q-btn
          :label="t('gameMode.buzzer.action.start')"
          icon="play_arrow"
          color="primary"
          unelevated
          no-caps
          data-testid="btn-game-start"
          @click="start()"
        />
        <q-btn
          :label="t('gameMode.buzzer.action.settings')"
          icon="tune"
          outline
          no-caps
          data-testid="btn-game-settings"
          @click="settings"
        />
      </template>

      <!-- Question is open -->
      <q-btn
        v-else-if="gameState.name === 'running'"
        :label="t('gameMode.buzzer.action.cancel')"
        outline
        no-caps
        data-testid="btn-game-cancel"
        @click="restart()"
      />

      <!-- Result menu -->
      <template
        v-else-if="
          gameState.name === 'answering' || gameState.name === 'answered'
        "
      >
        <buzzer-leaderboard-buttons
          :controller="findControllerById(gameState.controller)"
          @update="onPointsUpdate"
        />

        <q-separator class="q-my-xs" />

        <div class="row no-wrap q-col-gutter-x-sm">
          <div class="col">
            <q-btn
              class="full-width"
              :label="t('gameMode.buzzer.action.reOpen')"
              icon="loop"
              outline
              no-caps
              :disable="disableContinue"
              data-testid="btn-game-reopen"
              @click="continueQuestion()"
            />
          </div>
          <div class="col">
            <q-btn
              class="full-width"
              :label="t('gameMode.buzzer.action.quickPlay')"
              icon="fast_forward"
              color="primary"
              unelevated
              no-caps
              data-testid="btn-game-quick-play"
              @click="quickPlay()"
            />
          </div>
        </div>

        <q-btn
          :label="t('gameMode.buzzer.action.reset')"
          icon="replay"
          outline
          no-caps
          data-testid="btn-game-restart"
          @click="restart()"
        />
      </template>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import BuzzerLeaderboardButtons from 'components/gameModes/buzzer/BuzzerLeaderboardButtons.vue';
import BuzzerSettingsDialog from 'components/gameModes/buzzer/BuzzerSettingsDialog.vue';
import PulseCircle from 'components/PulseCircle.vue';
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  type ButtonEvent,
  BuzzerButton,
  type IController,
} from 'src/plugins/buzzer/types';
import { useQuasar } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import type { BuzzerState } from 'app/common/gameState/BuzzerState';
import { useGameState } from 'src/composables/gameState';
import TimerAnimated from 'components/TimerAnimated.vue';
import { useTimer } from 'src/composables/timer';
import AudioBeep from 'components/AudioBeep.vue';
import { useAudio } from 'src/composables/audio';
import { useShortcuts } from 'src/composables/shortcuts';
import { storeToRefs } from 'pinia';

const quasar = useQuasar();
const { t, n } = useI18n();
const quizSettingsStore = useGameSettingsStore();
const { buzzerSettings } = storeToRefs(quizSettingsStore);
const { createAudio } = useAudio();
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

const audio = createAudio('sounds/buzzer.mp3');

onBeforeMount(async () => {
  await buzzer.reset();
  buzzer.on('press', listener);

  audio.load();
});

onUnmounted(async () => {
  buzzer.removeListener('press', listener);
  await buzzer.reset();
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

  if (buzzerSettings.value.multipleAttempts) {
    return false;
  }

  const pressedControllers = gameState.value.pressedControllers;

  return !controllers.value.some(
    (controller) => !pressedControllers.includes(controller.id),
  );
});

/** Share of the answer time still on the clock, 0…1. */
const remaining = computed<number>(() => {
  const state = gameState.value;
  const total = buzzerSettings.value.answerTime;

  if (state.name !== 'answering' || total <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, state.time / total));
});

/** Amber below five seconds, red below three — same thresholds as the cast. */
const timeTone = computed<'calm' | 'warn' | 'alert'>(() => {
  const state = gameState.value;

  if (state.name !== 'answering') {
    return 'calm';
  }

  if (state.time <= 3) {
    return 'alert';
  }

  return state.time <= 5 ? 'warn' : 'calm';
});

const listener = transition('running', (state, event: ButtonEvent) => {
  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (
    !buzzerSettings.value.multipleAttempts &&
    state.pressedControllers.includes(event.controller.id)
  ) {
    return;
  }

  event.controller.setLight(true);

  if (buzzerSettings.value.playSounds) {
    void audio.play();
  }

  const pressedControllers = [...state.pressedControllers];
  if (!state.pressedControllers.includes(event.controller.id)) {
    pressedControllers.push(event.controller.id);
  }

  return {
    game: 'buzzer',
    name: 'answering',
    time: buzzerSettings.value.answerTime,
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

onStateEntry('preparing', async () => {
  await buzzer.reset();
});

onStateEntry('answering', (state) => {
  time.value = state.time;
  startTimer();
});
onStateExit('answering', async () => {
  stopTimer();
  await buzzer.reset();
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

// Enter always means "keep the show moving", Escape always means "back to the
// start of the question". Both no-op in states they do not apply to.
useShortcuts({
  Enter: () => {
    if (gameState.value.name === 'preparing') {
      start();
      return;
    }

    quickPlay();
  },
  Escape: () => restart(),
});

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

<style lang="scss" scoped>
.bm-buzzed {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-left: 3px solid var(--bm-accent);
  border-radius: 0 var(--bm-radius) var(--bm-radius) 0;
  background: linear-gradient(90deg, var(--bm-accent-soft), transparent);
}

.bm-buzzed__dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--bm-accent);
  flex: 0 0 auto;
}

.bm-buzzed__name {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  overflow-wrap: anywhere;
}

.bm-countdown {
  width: 100%;
  color: var(--bm-ink);
}

.bm-countdown--warn {
  color: var(--bm-warn);
}

.bm-countdown--alert {
  color: var(--bm-accent-text);
}

.bm-clock {
  font-size: clamp(3.5rem, 20vw, 5.5rem);
  font-weight: 500;
  line-height: 1;
}

.bm-clock__track {
  width: min(240px, 70%);
  height: 4px;
  border-radius: 2px;
  background: var(--bm-line);
  overflow: hidden;
  margin-top: 18px;
}

.bm-clock__track span {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: currentColor;
  transition: width 0.1s linear;
}

.bm-verdict {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.1;
}

.bm-waiting {
  width: min(230px, 62vw);
  font-size: 1.1rem;
  padding: 18px;
}

.bm-actions {
  flex: 0 0 auto;
  width: 100%;
  max-width: 420px;
  align-self: center;
  padding-top: 18px;
}
</style>
