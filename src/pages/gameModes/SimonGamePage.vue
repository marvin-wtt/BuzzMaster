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
          :timer="20"
        />
      </div>

      <!-- Per-player status -->
      <div
        v-if="gameState.name !== 'preparing' && gameState.name !== 'gameOver'"
        class="column q-gutter-xs"
      >
        <div class="text-subtitle2">{{ t('gameMode.simon.playerStatus') }}</div>
        <div class="row q-gutter-sm">
          <q-chip
            v-for="c in controllers"
            :key="c.id"
            v-show="gameState.players.includes(c.id)"
            :color="chipColor(c.id)"
            text-color="white"
          >
            {{ c.name }}
          </q-chip>
        </div>
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
        <q-btn
          v-if="gameState.name !== 'preparing'"
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
import { onBeforeMount, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';
import { BuzzerButton, type ButtonEvent } from 'src/plugins/buzzer/types';
import { useGameState } from 'src/composables/gameState';
import type { SimonState } from 'app/common/gameState/SimonState';
import { useControllerFlasher } from 'src/composables/controllerFlasher';
import SimonPad from 'components/gameModes/SimonPad.vue';

const { t } = useI18n();
const { controllers, buzzer } = useBuzzer();
const flasher = useControllerFlasher();

const SIMON_BUTTONS: BuzzerButton[] = [
  BuzzerButton.ORANGE,
  BuzzerButton.BLUE,
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

onBeforeMount(async () => {
  await buzzer.reset();
  buzzer.on('press', onPress);
});

onUnmounted(async () => {
  buzzer.removeListener('press', onPress);
  await buzzer.reset();
});

const randomSimonButton = (): BuzzerButton => {
  const i = Math.floor(Math.random() * SIMON_BUTTONS.length);

  return SIMON_BUTTONS[i]!;
};

const controllerStatus = (
  controllerId: string,
): 'done' | 'failed' | 'playing' | undefined => {
  const state = gameState.value;

  if (state.name === 'roundOver') {
    return state.survivors.includes(controllerId) ? 'done' : 'failed';
  }

  if (state.name === 'input') {
    const progress = state.inputIndex[controllerId] ?? 0;
    if (progress === -1) {
      return 'failed';
    }
    if (progress === state.sequence.length) {
      return 'done';
    }
    return 'playing';
  }

  return undefined;
};

const chipColor = (controllerId: string) => {
  const status = controllerStatus(controllerId);

  switch (status) {
    case 'done':
      return 'green';
    case 'failed':
      return 'red';
    case 'playing':
      return 'blue-grey';
    default:
      return 'grey-7';
  }
};

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

onStateEntry('showing', () => {
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

onStateEntry('input', (state) => {
  flasher.stopAll();

  for (const controller of controllers.value) {
    const on = !state.players.includes(controller.id);
    controller.setLight(on);
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

  const idx = state.inputIndex[id] ?? 0;

  // Ignore inputs for controllers that already failed or completed the sequence
  if (idx > state.sequence.length) {
    return;
  }

  const inputIndex = { ...state.inputIndex };
  if (event.button === state.sequence[idx]) {
    inputIndex[id] = idx + 1;

    if (inputIndex[id] === state.sequence.length) {
      flasher.flash(event.controller, 3);
    } else {
      flasher.flash(event.controller, 1);
    }
  } else {
    // Light always on for invalid input
    event.controller.setLight(true);

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
    round: state.round + 1,
    inputIndex,
  };
});
</script>

<style scoped></style>
