<!-- PongGamePage.vue -->
<template>
  <q-page class="pong-page">
    <!-- ── Preparing ── -->
    <div
      v-if="gameState.name === 'preparing'"
      class="preparing-layout q-pa-md"
    >
      <div class="text-center q-mb-md">
        <div class="text-h5 text-weight-bold">
          {{ t('gameMode.pong.setup.title') }}
        </div>
        <div class="text-caption text-grey-5 q-mt-xs">
          {{ t('gameMode.pong.setup.hint') }}
        </div>
      </div>

      <!-- Team column labels -->
      <div class="row items-center q-mb-xs q-px-xs">
        <div
          class="team-label text-caption text-weight-bold"
          style="color: #2196f3"
        >
          ◄ {{ t('gameMode.pong.team.left') }}
        </div>
        <div class="col-grow" />
        <q-btn
          flat
          round
          dense
          icon="shuffle"
          :disable="controllers.length === 0"
          class="text-grey-5"
          size="sm"
          @click="handleRandomAssign()"
        >
          <q-tooltip>{{ t('gameMode.pong.action.randomAssign') }}</q-tooltip>
        </q-btn>
        <div class="col-grow" />
        <div
          class="team-label text-caption text-weight-bold"
          style="color: #ff9800"
        >
          {{ t('gameMode.pong.team.right') }} ►
        </div>
      </div>

      <!-- Controller list -->
      <q-list
        bordered
        rounded
        class="controller-list q-mb-md"
      >
        <q-item v-if="controllers.length === 0">
          <q-item-section class="text-center text-grey-5 text-caption q-py-sm">
            {{ t('gameMode.pong.setup.noControllers') }}
          </q-item-section>
        </q-item>
        <q-item
          v-for="controller in controllers"
          :key="controller.id"
          dense
          class="controller-item"
        >
          <!-- Left toggle -->
          <q-item-section side>
            <q-btn
              label="L"
              :unelevated="gameState.left.controllerIds.includes(controller.id)"
              :outline="!gameState.left.controllerIds.includes(controller.id)"
              :style="
                gameState.left.controllerIds.includes(controller.id)
                  ? 'background:#2196f3; color:white'
                  : 'color:#2196f3; border-color:#2196f3'
              "
              dense
              round
              size="sm"
              @click="handleTeamClick(controller.id, 'left')"
            />
          </q-item-section>

          <!-- Controller name (color = assigned team) -->
          <q-item-section class="text-center">
            <span
              class="text-weight-medium"
              :style="controllerNameStyle(controller.id)"
            >
              {{ controller.name }}
            </span>
          </q-item-section>

          <!-- Right toggle -->
          <q-item-section side>
            <q-btn
              label="R"
              :unelevated="
                gameState.right.controllerIds.includes(controller.id)
              "
              :outline="!gameState.right.controllerIds.includes(controller.id)"
              :style="
                gameState.right.controllerIds.includes(controller.id)
                  ? 'background:#ff9800; color:white'
                  : 'color:#ff9800; border-color:#ff9800'
              "
              dense
              round
              size="sm"
              @click="handleTeamClick(controller.id, 'right')"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Start + Settings buttons -->
      <div class="row justify-center q-mt-sm">
        <div class="column q-gutter-sm">
          <q-btn
            :label="t('gameMode.pong.action.start')"
            :disable="
              gameState.left.controllerIds.length === 0 ||
              gameState.right.controllerIds.length === 0
            "
            color="primary"
            rounded
            unelevated
            data-testid="btn-start"
            @click="start()"
          >
            <q-tooltip
              v-if="
                gameState.left.controllerIds.length === 0 ||
                gameState.right.controllerIds.length === 0
              "
            >
              {{ t('gameMode.pong.setup.startHint') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            :label="t('gameMode.pong.action.settings')"
            outline
            rounded
            @click="openSettings()"
          />
        </div>
      </div>
    </div>

    <!-- ── Running / Paused / Completed ── -->
    <div
      v-else
      class="game-layout column items-center q-pa-sm"
    >
      <!-- Canvas + overlay wrapper -->
      <div class="relative-position canvas-container">
        <pong-renderer
          :frameA="interp.frameA ?? null"
          :frameB="interp.frameB ?? null"
          :renderSimTime="interp.renderSimTime"
          leftColor="#2196f3"
          rightColor="#ff9800"
        />

        <!-- State overlay -->
        <transition name="fade">
          <div
            v-if="showOverlay"
            class="absolute-full flex flex-center overlay-bg"
          >
            <div class="text-center">
              <div class="overlay-text">{{ overlayText }}</div>
              <div
                v-if="gameState.name === 'completed'"
                class="winner-text q-mt-sm"
              >
                {{ winnerText }}
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Controls hint -->
      <div class="controls-hint row q-gutter-lg q-mt-sm justify-center">
        <div class="row items-center q-gutter-xs">
          <q-badge
            style="background: #2196f3"
            rounded
          />
          <span class="text-caption text-grey-4">
            {{ t('gameMode.pong.team.left') }}
          </span>
        </div>
        <div class="text-caption text-grey-6">
          {{ t('gameMode.pong.controls.upButtons') }} = ↑ &nbsp;
          {{ t('gameMode.pong.controls.downButtons') }} = ↓
        </div>
        <div class="row items-center q-gutter-xs">
          <q-badge
            style="background: #ff9800"
            rounded
          />
          <span class="text-caption text-grey-4">
            {{ t('gameMode.pong.team.right') }}
          </span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="row justify-center q-mt-sm">
        <div class="column q-gutter-sm">
          <q-btn
            v-if="gameState.name === 'completed'"
            color="primary"
            :label="t('gameMode.pong.action.restart')"
            rounded
            unelevated
            data-testid="btn-restart"
            @click="restart()"
          />
          <q-btn
            v-else-if="gameState.name === 'running'"
            color="primary"
            :label="t('gameMode.pong.action.pause')"
            rounded
            unelevated
            data-testid="btn-pause"
            @click="pause()"
          />
          <q-btn
            v-else-if="gameState.name === 'paused'"
            color="primary"
            :label="t('gameMode.pong.action.resume')"
            rounded
            unelevated
            data-testid="btn-resume"
            @click="resume()"
          />
          <q-btn
            flat
            color="grey-5"
            :label="t('gameMode.pong.action.reset')"
            rounded
            data-testid="btn-reset"
            @click="reset()"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useBuzzer } from 'src/plugins/buzzer';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import PongRenderer from 'components/gameModes/pong/PongRenderer.vue';
import PongSettingsDialog from 'components/gameModes/pong/PongSettingsDialog.vue';

import type {
  Team,
  Ball,
  Paddle,
  StageFrame,
} from 'components/gameModes/pong/PongTypes';

import { useGameState } from 'src/composables/gameState';
import type {
  PongState,
  PongPreparingState,
  PongRunningState,
  PongPaused,
  PongEnded,
} from 'app/common/gameState/PongState';
import { useI18n } from 'vue-i18n';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import type {
  PongSpeedConfig,
  PongSpeedPreset,
} from 'app/common/gameSettings/PongSettings';
import { usePongAudio } from 'components/gameModes/pong/pong-audtio';

const { controllers } = useBuzzer();
const { t } = useI18n();
const quasar = useQuasar();
const gameSettingsStore = useGameSettingsStore();
const leaderboardStore = useLeaderboardStore();
const audio = usePongAudio();

const { gameState, transition, onStateEntry, onStateExit } =
  useGameState<PongState>({
    game: 'pong',
    name: 'preparing',
    left: { controllerIds: [] },
    right: { controllerIds: [] },
  });

/** Constants */
const WIDTH = 800;
const HEIGHT = 500;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 4;
const MAX_BALL_SPEED = 12;
const MAX_BOUNCE_ANGLE = Math.PI / 4;

const PONG_SPEED_CONFIGS: Record<PongSpeedPreset, PongSpeedConfig> = {
  slow: { initialSpeed: 1.0, speedIncrement: 1.03 },
  normal: { initialSpeed: 2.0, speedIncrement: 1.05 },
  fast: { initialSpeed: 3.0, speedIncrement: 1.07 },
  turbo: { initialSpeed: 5.0, speedIncrement: 1.1 },
};

const SIM_HZ = 120;
const DT_MS = 1000 / SIM_HZ;
const BUFFER_MS = 70;

let tick = 0;
let simEpoch = 0;
let accumulator = 0;
let simIntervalId: ReturnType<typeof setInterval> | null = null;
let lastWallNow = 0;

const left: Team = reactive({
  controllerIds: [],
  score: 0,
  paddle: {
    x: 20,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
  },
});

const right: Team = reactive({
  controllerIds: [],
  score: 0,
  paddle: {
    x: WIDTH - 30,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
  },
});

const ball: Ball = reactive({
  x: WIDTH / 2,
  y: HEIGHT / 2,
  vx: 1,
  vy: 0,
  radius: 8,
  speed: 1,
});

const showOverlay = ref(false);
const overlayText = ref('');
const winnerText = ref('');

const frames: StageFrame[] = reactive([]);
const MAX_FRAMES = 256;

// ── Frame helpers ──
function snapshotFrame(): StageFrame {
  return {
    tick,
    simTime: tick * DT_MS,
    left: { score: left.score, paddle: { ...left.paddle } },
    right: { score: right.score, paddle: { ...right.paddle } },
    ball: { ...ball },
  };
}

const updateRunningFrame = transition(
  'running',
  (state, frame: StageFrame): PongRunningState => {
    return { ...state, frame };
  },
);

function pushFrame(frame: StageFrame) {
  updateRunningFrame(frame);
  frames.push(frame);
  while (frames.length > MAX_FRAMES) {
    frames.shift();
  }
}

const interp = computed(() => {
  if (frames.length === 0) {
    return { frameA: null, frameB: null, renderSimTime: 0 };
  }

  const lastFrame = frames[frames.length - 1]!;

  if (gameState.value.name !== 'running') {
    return {
      frameA: lastFrame,
      frameB: lastFrame,
      renderSimTime: lastFrame.simTime,
    };
  }

  const now = performance.now();
  const renderSimTime = Math.max(0, now - simEpoch - BUFFER_MS);

  let A: StageFrame = lastFrame;
  let B: StageFrame = lastFrame;

  for (let i = frames.length - 2; i >= 0; i--) {
    if (frames[i]!.simTime <= renderSimTime) {
      A = frames[i]!;
      B = frames[i + 1] ?? frames[i]!;
      break;
    }
  }
  return { frameA: A, frameB: B, renderSimTime };
});

// ── Utils ──
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const blinkAssignments = new Map<string, 'left' | 'right'>();
let blinkLoopId: ReturnType<typeof setInterval> | null = null;
let blinkTick = 0;

function blinkLightOn(side: 'left' | 'right', tick: number): boolean {
  if (side === 'left') return tick % 4 === 0;
  const t = tick % 6;
  return t === 0 || t === 2;
}

function startBlinking(controllerId: string, side: 'left' | 'right') {
  blinkAssignments.set(controllerId, side);
  if (blinkLoopId !== null) return;
  blinkTick = 0;
  blinkLoopId = setInterval(() => {
    blinkAssignments.forEach((s, id) => {
      controllers.value
        .find((c) => c.id === id)
        ?.setLight(blinkLightOn(s, blinkTick));
    });
    blinkTick++;
  }, 200);
}

function stopBlinking(controllerId: string) {
  blinkAssignments.delete(controllerId);
  controllers.value.find((c) => c.id === controllerId)?.setLight(false);
  if (blinkAssignments.size === 0) {
    stopAllBlinking();
  }
}

function stopAllBlinking() {
  if (blinkLoopId !== null) {
    clearInterval(blinkLoopId);
    blinkLoopId = null;
  }
  blinkAssignments.clear();
  controllers.value.forEach((c) => c.setLight(false));
}

function flashControllers(controllerIds: string[]) {
  const cs = controllers.value.filter((c) => controllerIds.includes(c.id));
  let toggle = true;
  let count = 5;
  const interval = setInterval(() => {
    cs.forEach((c) => c.setLight(toggle));
    toggle = !toggle;
    if (count === 0) {
      clearInterval(interval);
      cs.forEach((c) => c.setLight(false));
    }
    count--;
  }, 150);
}

// ── Mechanics ──
function resetBall() {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.speed =
    PONG_SPEED_CONFIGS[gameSettingsStore.pongSettings.speed].initialSpeed;
  const dir = Math.random() > 0.5 ? 1 : -1;
  const angle = (Math.random() - 0.5) * (Math.PI / 6);
  ball.vx = dir * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);
}

function getTeamAction(team: Team) {
  return controllers.value
    .filter((c) => team.controllerIds.includes(c.id))
    .map((c) => {
      const up = c.buttons[BuzzerButton.BLUE] || c.buttons[BuzzerButton.ORANGE];
      const down =
        c.buttons[BuzzerButton.GREEN] || c.buttons[BuzzerButton.YELLOW];
      return up && !down ? -1 : down && !up ? 1 : 0;
    })
    .map((v) => v / team.controllerIds.length)
    .reduce((a, b) => a + b, 0);
}

function applyInput() {
  left.paddle.y += getTeamAction(left) * left.paddle.speed;
  right.paddle.y += getTeamAction(right) * right.paddle.speed;
  left.paddle.y = clamp(left.paddle.y, 0, HEIGHT - left.paddle.height);
  right.paddle.y = clamp(right.paddle.y, 0, HEIGHT - right.paddle.height);
}

function handlePaddleBounce(p: Paddle, isLeft: boolean) {
  if (isLeft) {
    ball.x = p.x + p.width + ball.radius;
  } else {
    ball.x = p.x - ball.radius;
  }

  const pCenter = p.y + p.height / 2;
  const collide = (ball.y - pCenter) / (p.height / 2);
  const angle = MAX_BOUNCE_ANGLE * clamp(collide, -1, 1);
  const direction = isLeft ? 1 : -1;

  ball.speed = Math.min(
    ball.speed *
      PONG_SPEED_CONFIGS[gameSettingsStore.pongSettings.speed].speedIncrement,
    MAX_BALL_SPEED,
  );
  ball.vx = direction * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);

  audio.playPaddleHit();
}

let wallSoundCooldown = 0;

function stepOnce() {
  applyInput();

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Walls
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > HEIGHT) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, HEIGHT - ball.radius);
    if (tick > wallSoundCooldown) {
      audio.playWallHit();
      wallSoundCooldown = tick + 4;
    }
  }

  // Left paddle
  const lp = left.paddle;
  if (
    ball.x - ball.radius < lp.x + lp.width &&
    ball.y > lp.y &&
    ball.y < lp.y + lp.height &&
    ball.vx < 0
  ) {
    handlePaddleBounce(lp, true);
  }

  // Right paddle
  const rp = right.paddle;
  if (
    ball.x + ball.radius > rp.x &&
    ball.y > rp.y &&
    ball.y < rp.y + rp.height &&
    ball.vx > 0
  ) {
    handlePaddleBounce(rp, false);
  }

  // Scoring
  if (ball.x < 0) {
    right.score++;
    audio.playScore();
    flashControllers(right.controllerIds);
    resetBall();
  } else if (ball.x > WIDTH) {
    left.score++;
    audio.playScore();
    flashControllers(left.controllerIds);
    resetBall();
  }

  tick++;
  pushFrame(snapshotFrame());

  if (
    left.score >= gameSettingsStore.pongSettings.rounds ||
    right.score >= gameSettingsStore.pongSettings.rounds
  ) {
    completeMatch();
  }
}

function startSimLoop() {
  lastWallNow = performance.now();
  simIntervalId = setInterval(() => {
    const now = performance.now();
    accumulator += now - lastWallNow;
    lastWallNow = now;
    while (accumulator >= DT_MS) {
      stepOnce();
      accumulator -= DT_MS;
    }
  }, Math.floor(DT_MS));
}

function stopSimLoop() {
  if (simIntervalId !== null) {
    clearInterval(simIntervalId);
    simIntervalId = null;
  }
}

function openSettings() {
  quasar.dialog({ component: PongSettingsDialog });
}

// ── Transitions ──
const start = transition(
  'preparing',
  (state: PongPreparingState): PongRunningState => {
    resetMatchInternals({ keepScores: false });
    const frame = snapshotFrame();
    return {
      game: 'pong',
      name: 'running',
      left: state.left,
      right: state.right,
      frame,
    };
  },
);

const restart = transition(
  'completed',
  (state: PongEnded): PongRunningState => {
    resetMatchInternals({ keepScores: false });
    const frame = snapshotFrame();
    return {
      game: 'pong',
      name: 'running',
      left: state.left,
      right: state.right,
      frame,
    };
  },
);

const toggleTeamAssignment = transition(
  'preparing',
  (
    state: PongPreparingState,
    controllerId: string,
    side: 'left' | 'right',
  ): PongPreparingState => {
    const wasInLeft = state.left.controllerIds.includes(controllerId);
    const wasInRight = state.right.controllerIds.includes(controllerId);
    const wasInSide = side === 'left' ? wasInLeft : wasInRight;

    const leftIds = state.left.controllerIds.filter(
      (id) => id !== controllerId,
    );
    const rightIds = state.right.controllerIds.filter(
      (id) => id !== controllerId,
    );

    if (!wasInSide) {
      if (side === 'left') leftIds.push(controllerId);
      else rightIds.push(controllerId);
    }

    return {
      game: 'pong',
      name: 'preparing',
      left: { controllerIds: leftIds },
      right: { controllerIds: rightIds },
    };
  },
);

function controllerNameStyle(id: string): string {
  if (gameState.value.name !== 'preparing') {
    return '';
  }
  if (gameState.value.left.controllerIds.includes(id)) {
    return 'color:#2196f3';
  }
  if (gameState.value.right.controllerIds.includes(id)) {
    return 'color:#ff9800';
  }
  return '';
}

const randomAssignTeams = transition('preparing', (): PongPreparingState => {
  const ids = [...controllers.value.map((c) => c.id)];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  const mid = Math.ceil(ids.length / 2);
  return {
    game: 'pong',
    name: 'preparing',
    left: { controllerIds: ids.slice(0, mid) },
    right: { controllerIds: ids.slice(mid) },
  };
});

function handleRandomAssign() {
  stopAllBlinking();
  randomAssignTeams();
  const state = gameState.value;
  if (state.name !== 'preparing') return;
  state.left.controllerIds.forEach((id) => startBlinking(id, 'left'));
  state.right.controllerIds.forEach((id) => startBlinking(id, 'right'));
}

function handleTeamClick(controllerId: string, side: 'left' | 'right') {
  const state = gameState.value;
  if (state.name !== 'preparing') return;

  const wasInSide =
    side === 'left'
      ? state.left.controllerIds.includes(controllerId)
      : state.right.controllerIds.includes(controllerId);

  toggleTeamAssignment(controllerId, side);

  if (!wasInSide) {
    startBlinking(controllerId, side);
  } else {
    stopBlinking(controllerId);
  }
}

const pause = transition('running', (state: PongRunningState): PongPaused => {
  return {
    game: 'pong',
    name: 'paused',
    left: state.left,
    right: state.right,
    frame: state.frame,
  };
});

const resume = transition('paused', (state: PongPaused): PongRunningState => {
  const frame = state.frame ?? snapshotFrame();
  const now = performance.now();
  simEpoch = now - (frame?.simTime ?? tick * DT_MS);
  lastWallNow = now;
  accumulator = 0;
  return {
    game: 'pong',
    name: 'running',
    left: state.left,
    right: state.right,
    frame,
  };
});

const reset = transition(
  ['running', 'paused', 'completed'],
  (): PongPreparingState => {
    resetMatchInternals({ keepScores: false });
    return {
      game: 'pong',
      name: 'preparing',
      left: { controllerIds: [] },
      right: { controllerIds: [] },
    };
  },
);

const complete = transition('running', (state: PongRunningState): PongEnded => {
  return {
    game: 'pong',
    name: 'completed',
    left: state.left,
    right: state.right,
    frame: snapshotFrame(),
  };
});

function completeMatch() {
  audio.playGameOver();

  const points = gameSettingsStore.pongSettings.pointsForWin;
  if (points > 0) {
    const winner = left.score > right.score ? left : right;
    winner.controllerIds.forEach((id) =>
      leaderboardStore.addPoints(id, points),
    );
  }

  complete();
}

// ── State entry/exit ──
onStateEntry('preparing', () => {
  showOverlay.value = false;
  overlayText.value = '';
  winnerText.value = '';
});

onStateExit('preparing', () => {
  stopAllBlinking();
});

onStateEntry('running', (state) => {
  left.controllerIds = state.left.controllerIds;
  right.controllerIds = state.right.controllerIds;

  showOverlay.value = false;
  overlayText.value = '';

  const now = performance.now();
  const baseSim = state.frame?.simTime ?? tick * DT_MS;
  simEpoch = now - baseSim;
  lastWallNow = now;
  accumulator = 0;

  startSimLoop();
});

onStateExit('running', () => {
  stopSimLoop();
});

onStateEntry('paused', () => {
  showOverlay.value = true;
  overlayText.value = t('gameMode.pong.overlay.paused');
});

onStateEntry('completed', () => {
  showOverlay.value = true;
  overlayText.value = t('gameMode.pong.overlay.gameOver');
  winnerText.value =
    left.score >= gameSettingsStore.pongSettings.rounds
      ? `${t('gameMode.pong.team.left')} wins! 🎉`
      : `${t('gameMode.pong.team.right')} wins! 🎉`;
});

function resetMatchInternals(opts: { keepScores: boolean }) {
  stopSimLoop();
  tick = 0;
  wallSoundCooldown = 0;
  frames.splice(0, frames.length);

  if (!opts.keepScores) {
    left.score = 0;
    right.score = 0;
  }

  left.paddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  right.paddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  resetBall();

  pushFrame(snapshotFrame());
}

onMounted(() => {
  pushFrame(snapshotFrame());
});

onUnmounted(() => {
  stopSimLoop();
  stopAllBlinking();
});
</script>

<style scoped>
.pong-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.preparing-layout {
  display: flex;
  flex-direction: column;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}

.team-label {
  min-width: 48px;
}

.controller-list {
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.controller-item {
  min-height: 52px;
}

.game-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.canvas-container {
  display: inline-flex;
}

.overlay-bg {
  background: rgba(0, 0, 0, 0.72);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.overlay-text {
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 700;
  color: white;
  letter-spacing: 0.05em;
}

.winner-text {
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: rgba(255, 255, 255, 0.85);
}

.controls-hint {
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
