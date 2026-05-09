<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column no-wrap">
      <!-- Content -->
      <div class="col-grow column items-center justify-center q-gutter-sm">
        <div class="row q-gutter-sm">
          <q-chip>
            {{ t('gameMode.simon.round', { round: gameState.round }) }}
          </q-chip>
          <q-chip
            v-if="
              gameState.name !== 'preparing' && gameState.name !== 'gameOver'
            "
          >
            {{ t('gameMode.simon.players', { n: gameState.players.length }) }}
          </q-chip>
        </div>

        <!-- 4 button visualization -->
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

        <!-- Input timer -->
        <timer-animated
          v-if="gameState.name === 'input' && gameState.timeLimit > 0"
          :time="inputTimer"
        />

        <!-- Player status during input: summary badges, hover for per-player detail -->
        <div
          v-if="gameState.name === 'input'"
          class="cursor-help"
        >
          <div class="row q-gutter-xs items-center">
            <q-badge
              v-if="inputSummary.done > 0"
              color="positive"
            >
              {{ t('gameMode.simon.summary.done', { n: inputSummary.done }) }}
            </q-badge>
            <q-badge
              v-if="inputSummary.out > 0"
              color="negative"
            >
              {{ t('gameMode.simon.summary.out', { n: inputSummary.out }) }}
            </q-badge>
            <q-badge
              v-if="inputSummary.playing > 0"
              color="grey-7"
            >
              {{
                t('gameMode.simon.summary.playing', { n: inputSummary.playing })
              }}
            </q-badge>
          </div>

          <q-tooltip :delay="150">
            <div
              class="tooltip-grid"
              :style="{
                gridTemplateColumns:
                  inputPlayerStatus.length > 6 ? '1fr 1fr' : '1fr',
              }"
            >
              <div
                v-for="player in inputPlayerStatus"
                :key="player.id"
                class="tooltip-row"
              >
                <span class="tooltip-name">{{ player.name }}</span>
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
                  color="grey-5"
                >
                  {{ player.progress }}/{{ player.total }}
                </q-badge>
              </div>
            </div>
          </q-tooltip>
        </div>

        <!-- Round over: same pattern as input phase — summary + hover for full list -->
        <div
          v-if="gameState.name === 'roundOver'"
          class="cursor-help"
        >
          <div class="row q-gutter-xs items-center">
            <q-badge
              v-if="roundOverSummary.survived > 0"
              color="positive"
            >
              {{
                t('gameMode.simon.summary.survived', {
                  n: roundOverSummary.survived,
                })
              }}
            </q-badge>
            <q-badge
              v-if="roundOverSummary.eliminated > 0"
              color="negative"
            >
              {{
                t('gameMode.simon.summary.eliminated', {
                  n: roundOverSummary.eliminated,
                })
              }}
            </q-badge>
          </div>

          <q-tooltip :delay="150">
            <div
              class="tooltip-grid"
              :style="{
                gridTemplateColumns:
                  roundOverPlayerStatus.length > 6 ? '1fr 1fr' : '1fr',
              }"
            >
              <div
                v-for="player in roundOverPlayerStatus"
                :key="player.id"
                class="tooltip-row"
              >
                <span class="tooltip-name">{{ player.name }}</span>
                <q-badge :color="player.survived ? 'positive' : 'negative'">
                  {{
                    player.survived
                      ? t('gameMode.simon.status.done')
                      : t('gameMode.simon.status.out')
                  }}
                </q-badge>
              </div>
            </div>
          </q-tooltip>
        </div>

        <!-- Winner during gameOver -->
        <div
          v-if="gameState.name === 'gameOver'"
          class="column items-center q-gutter-sm"
        >
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
      <div class="col-4 column q-gutter-y-sm justify-center content-center">
        <template v-if="gameState.name === 'preparing'">
          <q-btn
            class="self-center"
            color="primary"
            rounded
            :label="t('gameMode.simon.action.start')"
            :disable="controllers.length === 0"
            @click="start()"
          />
          <q-btn
            class="self-center"
            outline
            rounded
            :label="t('gameMode.simon.action.settings')"
            @click="openSettings()"
          />
        </template>

        <template v-else-if="gameState.name === 'roundOver'">
          <q-btn
            class="self-center"
            color="primary"
            rounded
            :label="t('gameMode.simon.action.nextRound')"
            @click="nextRound()"
          />
          <q-btn
            class="self-center"
            outline
            rounded
            :label="t('gameMode.simon.action.restart')"
            @click="restart()"
          />
        </template>

        <!-- Input: require confirmation to restart -->
        <safe-delete-btn
          v-else-if="gameState.name === 'input'"
          class="self-center"
          :label="t('gameMode.simon.action.restart')"
          outline
          rounded
          @click="restart()"
        />

        <!-- Showing / Game over -->
        <q-btn
          v-else
          class="self-center"
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
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useBuzzer } from 'src/plugins/buzzer';
import { type ButtonEvent, BuzzerButton } from 'src/plugins/buzzer/types';
import { useGameState } from 'src/composables/gameState';
import { useTimer } from 'src/composables/timer';
import type {
  SimonInputState,
  SimonState,
} from 'app/common/gameState/SimonState';
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
const { masterVolume } = useAudio();
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

const BUTTON_FREQUENCIES: Partial<Record<BuzzerButton, number>> = {
  [BuzzerButton.YELLOW]: 329.628, // E4
  [BuzzerButton.GREEN]: 440.0, // A4
  [BuzzerButton.ORANGE]: 554.365, // C#5
  [BuzzerButton.BLUE]: 659.255, // E5
};

let audioCtx: AudioContext | null = null;

onBeforeMount(async () => {
  await buzzer.reset();
  buzzer.on('press', onPress);
});

onUnmounted(async () => {
  buzzer.removeListener('press', onPress);
  await buzzer.reset();
  void audioCtx?.close();
  audioCtx = null;
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
  const playerNames = Object.fromEntries(
    controllers.value.map((c) => [c.id, c.name]),
  );

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

onStateEntry('showing', async (state) => {
  await buzzer.reset();

  // Turn on light for all players until sequence is complete
  controllers.value
    .filter((c) => state.players.includes(c.id))
    .forEach((c) => c.setLight(true));

  scheduleHighlight(BASE_SHOW_ON_MS);
});

onStateExit('showing', (state) => {
  // Turn off lights again
  controllers.value
    .filter((c) => state.players.includes(c.id))
    .forEach((c) => c.setLight(false));

  clearHighlightTimeouts();
});

const updateHighlight = transition('showing', (state) => {
  if (state.stepIndex >= state.sequence.length && state.showing === false) {
    const INITIAL_TIME_S = 5;
    const timeLimit =
      INITIAL_TIME_S + simonSettings.value.answerTime * state.sequence.length;

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

const getPerceivedVolume = (volume: number) => {
  const curveK = 9;

  return 1 - Math.log(1 + curveK * (1 - volume)) / Math.log(1 + curveK);
};

const playButtonSound = (button: BuzzerButton) => {
  const frequency = BUTTON_FREQUENCIES[button];
  if (frequency === undefined) return;

  audioCtx ??= new AudioContext();

  const speed =
    simonSettings.value.showingSpeed > 0 ? simonSettings.value.showingSpeed : 1;

  const duration = BASE_SHOW_ON_MS / speed / 1000;
  const now = audioCtx.currentTime;

  const volume = getPerceivedVolume(masterVolume.value);
  if (volume <= 0) return;

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  // Triangle is warmer than sine, but less harsh than square.
  oscillator.type = 'triangle';

  // Small pitch glide gives the sound a more game-like character.
  oscillator.frequency.setValueAtTime(frequency * 0.985, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.025);

  // Slight low-pass filtering makes it less sharp.
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.Q.setValueAtTime(0.8, now);

  const attack = Math.min(0.015, duration * 0.1);
  const decay = Math.min(0.06, duration * 0.25);
  const release = Math.min(0.08, duration * 0.25);

  const peakVolume = volume * 0.35;
  const sustainVolume = volume * 0.22;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakVolume, now + attack);
  gain.gain.exponentialRampToValueAtTime(sustainVolume, now + attack + decay);

  gain.gain.setValueAtTime(
    sustainVolume,
    now + Math.max(attack + decay, duration - release),
  );

  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
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

onStateEntry('roundOver', () => {
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

const resolveWinner = (state: SimonInputState, id: string | undefined) => {
  if (!id) {
    if (state.players.length > 1 || !simonSettings.value.lastManStanding) {
      return undefined;
    }

    // If only one player was playing and lastManStanding is enabled, consider them the winner even if they failed on the last round
    id = state.players[0]!;
  }

  return state.playerNames[id] ?? id;
};

const isGameOver = (survivorCount: number) =>
  simonSettings.value.lastManStanding
    ? survivorCount === 0
    : survivorCount <= 1;

const onInputTimeout = transition('input', (state) => {
  const survivors = state.players.filter(
    (p) => (state.inputIndex[p] ?? 0) === state.sequence.length,
  );

  if (isGameOver(survivors.length)) {
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

    if (isGameOver(survivors.length)) {
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

const inputSummary = computed(() => {
  let done = 0;
  let out = 0;
  for (const p of inputPlayerStatus.value) {
    if (p.done) done++;
    else if (p.failed) out++;
  }
  return { done, out, playing: inputPlayerStatus.value.length - done - out };
});

const roundOverPlayerStatus = computed(() => {
  if (gameState.value.name !== 'roundOver') return [];
  const s = gameState.value;
  const survivorSet = new Set(s.survivors);
  return s.players.map((id) => ({
    id,
    name: s.playerNames[id] ?? id,
    survived: survivorSet.has(id),
  }));
});

const roundOverSummary = computed(() => ({
  survived: roundOverPlayerStatus.value.filter((p) => p.survived).length,
  eliminated: roundOverPlayerStatus.value.filter((p) => !p.survived).length,
}));

const openSettings = () => {
  quasar.dialog({ component: SimonSettingsDialog });
};
</script>

<style scoped>
.simon-pad-wrap {
  width: min(240px, 80vw);
}

/* Tooltip player grid — switches to 2 columns when > 6 players (via inline style) */
.tooltip-grid {
  display: grid;
  gap: 2px 16px;
  min-width: 160px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 1px 0;
}

.tooltip-name {
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
