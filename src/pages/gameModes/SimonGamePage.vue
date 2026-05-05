<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column q-gutter-md no-wrap">
      <div class="row justify-center q-gutter-sm">
        <q-chip>
          {{ t('gameMode.simon.round', { round: gameState.round }) }}
        </q-chip>
        <q-chip
          v-if="gameState.name !== 'preparing' && gameState.name !== 'gameOver'"
        >
          {{ t('gameMode.simon.players', { n: gameState.players.length }) }}
        </q-chip>
      </div>

      <!-- 4 button visualization -->
      <div class="row justify-center">
        <div class="simon-pad-wrap">
          <simon-pad
            v-if="gameState.name === 'showing'"
            :buttons="SIMON_BUTTONS"
            :highlight="
              gameState.showing ? gameState.sequence[gameState.stepIndex] : null
            "
          />
          <simon-pad
            v-else
            :buttons="SIMON_BUTTONS"
          />
        </div>
      </div>

      <!-- Input timer -->
      <div
        v-if="gameState.name === 'input' && gameState.timeLimit > 0"
        class="row justify-center"
      >
        <timer-animated :time="inputTimer" />
      </div>

      <!-- Player status during input -->
      <div
        v-if="gameState.name === 'input'"
        class="row justify-center"
      >
        <div
          class="column q-gutter-xs"
          style="min-width: 200px"
        >
          <div class="text-caption text-grey">
            {{ t('gameMode.simon.playerStatus') }}
          </div>
          <div
            v-for="player in inputPlayerStatus"
            :key="player.id"
            class="row items-center q-gutter-sm"
          >
            <span class="col text-body2 ellipsis">{{ player.name }}</span>
            <q-badge
              v-if="player.done"
              color="positive"
            >
              {{ t('gameMode.simon.status.done') }}
            </q-badge>
            <q-badge
              v-else-if="player.failed"
              color="negative"
            >
              {{ t('gameMode.simon.status.out') }}
            </q-badge>
            <q-badge
              v-else
              color="grey-7"
            >
              {{ player.progress }}/{{ player.total }}
            </q-badge>
          </div>
        </div>
      </div>

      <!-- Survivors during roundOver: summary + expandable list -->
      <div
        v-if="gameState.name === 'roundOver'"
        class="column items-center q-gutter-xs"
      >
        <div class="row items-center q-gutter-sm">
          <q-chip
            icon="group"
            color="positive"
            text-color="white"
            dense
          >
            {{
              t('gameMode.simon.survived', {
                n: gameState.survivors.length,
                total: gameState.players.length,
              })
            }}
          </q-chip>
          <q-btn
            flat
            round
            dense
            size="sm"
            :icon="showSurvivors ? 'expand_less' : 'expand_more'"
            @click="showSurvivors = !showSurvivors"
          />
        </div>

        <transition name="survivor-list">
          <div
            v-if="showSurvivors"
            class="row justify-center q-gutter-xs"
          >
            <q-chip
              v-for="id in gameState.survivors"
              :key="id"
              dense
              color="positive"
              text-color="white"
              icon="check"
            >
              {{ gameState.playerNames[id] ?? id }}
            </q-chip>
          </div>
        </transition>
      </div>

      <!-- Winner during gameOver -->
      <div
        v-if="gameState.name === 'gameOver'"
        class="row justify-center"
      >
        <div class="column items-center q-gutter-sm">
          <div class="text-subtitle2 text-grey">
            {{ t('gameMode.simon.winner') }}
          </div>
          <q-chip
            v-if="gameState.winner"
            icon="emoji_events"
            color="positive"
            text-color="white"
            class="text-weight-bold text-body1"
          >
            {{ gameState.winner }}
          </q-chip>
          <span
            v-else
            class="text-body2 text-grey"
          >
            {{ t('gameMode.simon.noWinner') }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="row justify-center">
        <!-- Preparing -->
        <div
          v-if="gameState.name === 'preparing'"
          class="column q-gutter-sm justify-center"
        >
          <q-btn
            color="primary"
            rounded
            :label="t('gameMode.simon.action.start')"
            :disable="controllers.length === 0"
            @click="start()"
          />
          <q-btn
            outline
            rounded
            :label="t('gameMode.simon.action.settings')"
            @click="openSettings()"
          />
        </div>

        <!-- Round over -->
        <div
          v-else-if="gameState.name === 'roundOver'"
          class="column q-gutter-sm justify-center"
        >
          <q-btn
            color="primary"
            rounded
            :label="t('gameMode.simon.action.nextRound')"
            @click="nextRound()"
          />
          <q-btn
            outline
            rounded
            :label="t('gameMode.simon.action.restart')"
            @click="restart()"
          />
        </div>

        <!-- Input: require confirmation to restart -->
        <safe-delete-btn
          v-else-if="gameState.name === 'input'"
          :label="t('gameMode.simon.action.restart')"
          outline
          rounded
          @click="restart()"
        />

        <!-- Showing / Game over -->
        <q-btn
          v-else
          outline
          rounded
          :label="t('gameMode.simon.action.restart')"
          @click="restart()"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useBuzzer } from 'src/plugins/buzzer';
import { BuzzerButton, type ButtonEvent } from 'src/plugins/buzzer/types';
import { useGameState } from 'src/composables/gameState';
import { useTimer } from 'src/composables/timer';
import type { SimonState } from 'app/common/gameState/SimonState';
import { useControllerFlasher } from 'src/composables/controllerFlasher';
import SimonPad from 'components/gameModes/SimonPad.vue';
import SimonSettingsDialog from 'components/gameModes/simon/SimonSettingsDialog.vue';
import TimerAnimated from 'components/TimerAnimated.vue';
import { useAudio } from 'src/composables/audio';
import SafeDeleteBtn from 'components/SafeDeleteBtn.vue';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const quasar = useQuasar();
const { controllers, buzzer } = useBuzzer();
const { createAudio } = useAudio();
const flasher = useControllerFlasher({
  onMs: 75,
  offMs: 75,
});
const { simonSettings } = storeToRefs(useGameSettingsStore());
const {
  time: inputTimer,
  startTimer,
  stopTimer,
} = useTimer({
  direction: 'down',
  updateRate: 10,
});

const BASE_SHOW_ON_MS = 520;
const BASE_SHOW_OFF_MS = 260;

const SIMON_BUTTONS: BuzzerButton[] = [
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];

const { gameState, transition, onStateEntry, onStateExit } =
  useGameState<SimonState>({
    game: 'simon',
    name: 'preparing',
    round: 0,
    sequence: [],
    players: [],
  });

const sounds = {
  blue: createAudio('sounds/simon/blue.mp3'),
  orange: createAudio('sounds/simon/orange.mp3'),
  green: createAudio('sounds/simon/green.mp3'),
  yellow: createAudio('sounds/simon/yellow.mp3'),
};

onBeforeMount(async () => {
  await buzzer.reset();
  buzzer.on('press', onPress);

  for (const sound of Object.values(sounds)) {
    sound.load();
  }
});

onUnmounted(async () => {
  buzzer.removeListener('press', onPress);
  await buzzer.reset();
});

const randomSimonButton = (): BuzzerButton => {
  const i = Math.floor(Math.random() * SIMON_BUTTONS.length);

  return SIMON_BUTTONS[i]!;
};

onStateEntry('preparing', async () => {
  await buzzer.reset();
});

const start = transition('preparing', () => {
  const players = controllers.value.map((c) => c.id);
  const playerNames = Object.fromEntries(controllers.value.map((c) => [c.id, c.name]));

  const first = randomSimonButton();
  return {
    game: 'simon',
    name: 'showing',
    round: 1,
    sequence: [first],
    players,
    playerNames,
    stepIndex: 0,
    showing: false,
  };
});

const restart = transition(
  ['showing', 'input', 'roundOver', 'gameOver'],
  () => ({
    game: 'simon',
    name: 'preparing',
    round: 0,
    sequence: [],
    players: [],
  }),
);

const nextRound = transition('roundOver', (state) => {
  const next = randomSimonButton();
  return {
    game: 'simon',
    name: 'showing',
    round: state.round + 1,
    sequence: [...state.sequence, next],
    players: state.survivors,
    playerNames: state.playerNames,
    showing: false,
    stepIndex: 0,
  };
});

let highlightTimeout: NodeJS.Timeout | null = null;

const scheduleHighlight = (baseMs: number) => {
  const speed =
    simonSettings.value.showingSpeed > 0 ? simonSettings.value.showingSpeed : 1;
  highlightTimeout = setTimeout(updateHighlight, baseMs / speed);
};

const clearHighlightTimeouts = () => {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
    highlightTimeout = null;
  }
};

onUnmounted(clearHighlightTimeouts);

onStateEntry('showing', async () => {
  await buzzer.reset();

  scheduleHighlight(BASE_SHOW_ON_MS);
});

onStateExit('showing', clearHighlightTimeouts);

const updateHighlight = transition('showing', (state) => {
  if (state.stepIndex >= state.sequence.length && state.showing === false) {
    const timeLimit = simonSettings.value.answerTime + state.sequence.length;

    return {
      game: 'simon',
      name: 'input',
      round: state.round,
      sequence: state.sequence,
      players: state.players,
      playerNames: state.playerNames,
      inputIndex: {},
      timeLimit,
      startTime: Date.now(),
    };
  }

  // The order OFF -> ON
  if (!state.showing) {
    scheduleHighlight(BASE_SHOW_ON_MS);

    playButtonSound(state.sequence[state.stepIndex]!);

    return {
      ...state,
      showing: true,
    };
  }

  scheduleHighlight(BASE_SHOW_OFF_MS);

  return {
    ...state,
    showing: false,
    stepIndex: state.stepIndex + 1,
  };
});

const getButtonAudio = (button: BuzzerButton) => {
  switch (button) {
    case BuzzerButton.BLUE:
      return sounds.blue;
    case BuzzerButton.ORANGE:
      return sounds.orange;
    case BuzzerButton.GREEN:
      return sounds.green;
    case BuzzerButton.YELLOW:
      return sounds.yellow;
  }
};

const playButtonSound = (button: BuzzerButton) => {
  const sound = getButtonAudio(button);
  void sound?.play();
};

onStateEntry('input', (state) => {
  flasher.stopAll();

  if (state.timeLimit > 0) {
    inputTimer.value = state.timeLimit;
    startTimer();
  }
});

onStateExit('input', () => {
  stopTimer();
});

// Auto next round: kick off nextRound after a short delay when enabled
let autoNextRoundTimeout: NodeJS.Timeout | null = null;

const showSurvivors = ref(false);

onStateEntry('roundOver', () => {
  showSurvivors.value = false;
  if (simonSettings.value.autoNextRound) {
    autoNextRoundTimeout = setTimeout(() => {
      nextRound();
    }, 2000);
  }
});

onStateExit('roundOver', () => {
  if (autoNextRoundTimeout) {
    clearTimeout(autoNextRoundTimeout);
    autoNextRoundTimeout = null;
  }
});

onUnmounted(() => {
  if (autoNextRoundTimeout) clearTimeout(autoNextRoundTimeout);
});

const resolveWinner = (state: { playerNames: Record<string, string> }, id: string | undefined) => {
  if (!id) return undefined;
  return state.playerNames[id] ?? id;
};

const onInputTimeout = transition('input', (state) => {
  const survivors = state.players.filter(
    (p) => (state.inputIndex[p] ?? 0) === state.sequence.length,
  );

  if (survivors.length <= 1) {
    return {
      game: 'simon',
      name: 'gameOver',
      round: state.round,
      winner: resolveWinner(state, survivors[0]),
    };
  }

  return {
    game: 'simon',
    name: 'roundOver',
    round: state.round,
    sequence: state.sequence,
    players: state.players,
    playerNames: state.playerNames,
    survivors,
  };
});

watch(inputTimer, (val) => {
  if (val <= 0) {
    onInputTimeout();
  }
});

const onPress = transition('input', (state, event: ButtonEvent) => {
  if (!SIMON_BUTTONS.includes(event.button)) {
    return;
  }

  const id = event.controller.id;
  if (!state.players.includes(id)) {
    return;
  }

  // Idx is -1 for invalid input
  const idx = state.inputIndex[id] ?? 0;

  // Ignore inputs for controllers that already failed or completed the sequence
  if (idx === -1 || idx >= state.sequence.length) {
    return;
  }

  const inputIndex = { ...state.inputIndex };
  if (event.button === state.sequence[idx]) {
    inputIndex[id] = idx + 1;

    if (inputIndex[id] === state.sequence.length) {
      event.controller.setLight(true);
    } else {
      flasher.flash(event.controller, 1);
    }
  } else {
    flasher.flash(event.controller, 5);

    inputIndex[id] = -1;
  }

  const roundOver = state.players.every((p) => {
    const progress = inputIndex[p] ?? 0;

    return progress === -1 || progress === state.sequence.length;
  });

  if (roundOver) {
    const survivors = state.players.filter((p) => {
      const progress = inputIndex[p] ?? 0;

      return progress === state.sequence.length;
    });

    if (survivors.length <= 1) {
      return {
        game: 'simon',
        name: 'gameOver',
        round: state.round,
        winner: resolveWinner(state, survivors[0]),
      };
    }

    return {
      game: 'simon',
      name: 'roundOver',
      round: state.round,
      sequence: state.sequence,
      players: state.players,
      playerNames: state.playerNames,
      survivors,
    };
  }

  return {
    ...state,
    inputIndex,
  };
});

const inputPlayerStatus = computed(() => {
  if (gameState.value.name !== 'input') return [];
  const s = gameState.value;
  return s.players.map((id) => {
    const raw = s.inputIndex[id] ?? 0;
    return {
      id,
      name: s.playerNames[id] ?? id,
      failed: raw === -1,
      done: raw === s.sequence.length,
      progress: raw === -1 ? 0 : raw,
      total: s.sequence.length,
    };
  });
});

const openSettings = () => {
  quasar.dialog({ component: SimonSettingsDialog });
};
</script>

<style scoped>
.simon-pad-wrap {
  width: min(240px, 80vw);
}

.survivor-list-enter-active,
.survivor-list-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.survivor-list-enter-from,
.survivor-list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
