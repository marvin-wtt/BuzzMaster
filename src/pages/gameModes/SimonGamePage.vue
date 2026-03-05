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

      <!-- Actions -->
      <div class="row justify-center q-gutter-sm">
        <q-btn
          v-if="gameState.name === 'preparing'"
          color="primary"
          rounded
          :label="t('gameMode.simon.action.start')"
          :disable="controllers.length === 0"
          @click="start()"
        />
        <q-btn
          v-if="gameState.name === 'roundOver'"
          color="primary"
          rounded
          :label="t('gameMode.simon.action.nextRound')"
          @click="nextRound()"
        />
        <safe-delete-btn
          v-if="gameState.name === 'input'"
          :label="t('gameMode.simon.action.restart')"
          outline
          rounded
          @click="restart()"
        />

        <q-btn
          v-else-if="gameState.name !== 'preparing'"
          :label="t('gameMode.simon.action.restart')"
          outline
          rounded
          @click="restart()"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onBeforeMount, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';
import { BuzzerButton, type ButtonEvent } from 'src/plugins/buzzer/types';
import { useGameState } from 'src/composables/gameState';
import type { SimonState } from 'app/common/gameState/SimonState';
import { useControllerFlasher } from 'src/composables/controllerFlasher';
import SimonPad from 'components/gameModes/SimonPad.vue';
import { useAudio } from 'src/composables/audio';
import SafeDeleteBtn from 'components/SafeDeleteBtn.vue';

const { t } = useI18n();
const { controllers, buzzer } = useBuzzer();
const { createAudio } = useAudio();
const flasher = useControllerFlasher({
  onMs: 75,
  offMs: 75,
});

const SIMON_BUTTONS: BuzzerButton[] = [
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];

const SHOW_ON_MS = 520;
const SHOW_OFF_MS = 260;

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

  const first = randomSimonButton();
  return {
    game: 'simon',
    name: 'showing',
    round: 1,
    sequence: [first],
    players,
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
    showing: false,
    stepIndex: 0,
  };
});

let highlightTimeout: NodeJS.Timeout | null = null;

const scheduleHighlight = (timeout: number) => {
  highlightTimeout = setTimeout(updateHighlight, timeout);
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

  scheduleHighlight(SHOW_ON_MS);
});

onStateExit('showing', clearHighlightTimeouts);

const updateHighlight = transition('showing', (state) => {
  if (state.stepIndex >= state.sequence.length && state.showing === false) {
    return {
      game: 'simon',
      name: 'input',
      round: state.round,
      sequence: state.sequence,
      players: state.players,
      inputIndex: {},

      status: {},
    };
  }

  // The order OFF -> ON
  if (!state.showing) {
    scheduleHighlight(SHOW_ON_MS);

    playButtonSound(state.sequence[state.stepIndex]!);

    return {
      ...state,
      showing: true,
    };
  }

  scheduleHighlight(SHOW_OFF_MS);

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
  void sound.play();
};

onStateEntry('input', () => {
  flasher.stopAll();
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
        winner: survivors[0],
      };
    }

    return {
      game: 'simon',
      name: 'roundOver',
      round: state.round,
      sequence: state.sequence,
      players: state.players,
      survivors,
    };
  }

  return {
    ...state,
    inputIndex,
  };
});
</script>

<style scoped></style>
