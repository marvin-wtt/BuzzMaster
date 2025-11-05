<!-- PongGamePage.vue -->
<template>
  <q-page class="flex flex-center text-white">
    <div
      v-if="gameState.name === 'preparing'"
      class="column"
    >
      <q-list separator>
        <q-item
          v-for="controller in controllers"
          :key="controller.id"
        >
          <q-item-section class="col-shrink">
            <q-btn
              label="L"
              :outline="!gameState.left.controllerIds.includes(controller.id)"
              :color="
                gameState.left.controllerIds.includes(controller.id)
                  ? 'primary'
                  : undefined
              "
              round
              @click="toggleTeamAssignment(controller.id, 'left')"
            />
          </q-item-section>
          <q-item-section class="col-grow text-center">
            {{ controller.name }}
          </q-item-section>
          <q-item-section class="col-shrink">
            <q-btn
              label="R"
              :outline="!gameState.right.controllerIds.includes(controller.id)"
              :color="
                gameState.right.controllerIds.includes(controller.id)
                  ? 'primary'
                  : undefined
              "
              round
              @click="toggleTeamAssignment(controller.id, 'right')"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <div>
        <q-btn
          :label="t('gameMode.pong.action.start')"
          :disable="
            gameState.left.controllerIds.length === 0 ||
            gameState.right.controllerIds.length === 0
          "
          color="primary"
          rounded
          data-testid="btn-start"
          @click="start()"
        />
      </div>
    </div>

    <div
      v-else
      class="column items-center q-pa-sm"
    >
      {{ ball.speed }}
      <div class="relative-position">
        <pong-renderer
          :frameA="interp.frameA ?? null"
          :frameB="interp.frameB ?? null"
          :renderSimTime="interp.renderSimTime"
          :width="WIDTH"
          :height="HEIGHT"
        />

        <!-- Overlay -->
        <div
          v-if="showOverlay"
          class="absolute-full flex flex-center bg-black bg-opacity-70 text-h5 text-weight-medium"
        >
          {{ overlayText }}
        </div>
      </div>

      <div class="text-grey-5 text-center q-mt-md">
        <div>Controls via buzzers (BLUE/ORANGE = Up, GREEN/YELLOW = Down)</div>
      </div>

      <div class="row q-gutter-sm q-mt-md">
        <q-btn
          v-if="gameState.name === 'completed'"
          color="primary"
          label="Restart Game"
          rounded
          data-testid="btn-start"
          @click="start()"
        />
        <q-btn
          v-else-if="gameState.name === 'running'"
          color="primary"
          label="Pause Game"
          rounded
          data-testid="btn-pause"
          @click="pause()"
        />
        <q-btn
          v-else-if="gameState.name === 'paused'"
          color="primary"
          label="Resume"
          rounded
          data-testid="btn-resume"
          @click="resume()"
        />
        <q-btn
          flat
          color="grey-5"
          label="Reset"
          rounded
          data-testid="btn-reset"
          @click="reset()"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import PongRenderer from 'components/gameModes/pong/PongRenderer.vue';

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

const { controllers } = useBuzzer();
const { t } = useI18n();

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
const BALL_START_SPEED = 1;
const MAX_BALL_SPEED = 12;
const MAX_BOUNCE_ANGLE = Math.PI / 4; // 45°
const TARGET_SCORE = 7; // end a match at this score

/** Timing: fixed-step sim at 120 Hz; render with small delay for interpolation */
const SIM_HZ = 120;
const DT_MS = 1000 / SIM_HZ; // ~8.33 ms
const BUFFER_MS = 70; // render “behind” latest sim time

/** Authoritative sim state (local-only; mirrored to gameState via frames) */
let tick = 0;
let simEpoch = 0; // wall clock ms when sim started
let accumulator = 0;
let rafId: number = 0;
let lastWallNow = 0;

/** Teams & Ball (reactive so renderer can watch) */
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
  vx: BALL_START_SPEED,
  vy: 0,
  radius: 8,
  speed: BALL_START_SPEED,
});

/** UI overlay */
const showOverlay = ref(true);
const overlayText = ref('Click Start');

/** Interpolation buffer (ring) */
const frames: StageFrame[] = reactive([]);
const MAX_FRAMES = 256;

/** --- Frame helpers --- */
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
  // mirror into state machine
  updateRunningFrame(frame);

  frames.push(frame);
  while (frames.length > MAX_FRAMES) frames.shift();
}

/** Interp selection for renderer */
const interp = computed(() => {
  const now = performance.now();
  const renderSimTime = Math.max(0, now - simEpoch - BUFFER_MS);

  if (frames.length === 0) return { frameA: null, frameB: null, renderSimTime };

  let A = frames[0];
  let B = frames[frames.length - 1];

  for (let i = frames.length - 2; i >= 0; i--) {
    if (frames[i]!.simTime <= renderSimTime) {
      A = frames[i];
      B = frames[i + 1] ?? frames[i];
      break;
    }
  }
  return { frameA: A, frameB: B, renderSimTime };
});

/** Utils */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Visual feedback on scoring */
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

/** Mechanics */
function resetBall() {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.speed = BALL_START_SPEED;
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
  // Position correction
  if (isLeft) ball.x = p.x + p.width + ball.radius;
  else ball.x = p.x - ball.radius;

  const pCenter = p.y + p.height / 2;
  const collide = (ball.y - pCenter) / (p.height / 2); // [-1..1]
  const angle = MAX_BOUNCE_ANGLE * clamp(collide, -1, 1);
  const direction = isLeft ? 1 : -1;

  ball.speed = Math.min(ball.speed * 1.05, MAX_BALL_SPEED);
  ball.vx = direction * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);
}

/** One fixed-step tick */
function stepOnce() {
  applyInput();

  // Integrate
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Walls
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > HEIGHT) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, HEIGHT - ball.radius);
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
    flashControllers(right.controllerIds);
    resetBall();
  } else if (ball.x > WIDTH) {
    left.score++;
    flashControllers(left.controllerIds);
    resetBall();
  }

  // End condition
  if (left.score >= TARGET_SCORE || right.score >= TARGET_SCORE) {
    completeMatch();
    return; // stop ticking; state exit will cancel RAF
  }

  // Bookkeeping
  tick++;
  pushFrame(snapshotFrame());
}

/** Fixed-step loop (runs only in 'running') */
function frameLoop(now: number) {
  if (gameState.value.name !== 'running') {
    return;
  }
  const elapsed = now - lastWallNow;
  lastWallNow = now;
  accumulator += elapsed;

  while (accumulator >= DT_MS) {
    stepOnce();
    accumulator -= DT_MS;
  }
  rafId = requestAnimationFrame(frameLoop);
}

/** === Transitions === */

/** Preparing -> Running (assign teams & start) */
const start = transition(
  'preparing',
  (state: PongPreparingState): PongRunningState => {
    left.controllerIds = state.left.controllerIds;
    right.controllerIds = state.right.controllerIds;

    // reset sim
    resetMatchInternals({ keepScores: false });

    // seed first frame
    const frame = snapshotFrame();

    return {
      game: 'pong',
      name: 'running',
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
    // Snapshot originals to detect "toggle off"
    const wasInLeft = state.left.controllerIds.includes(controllerId);
    const wasInRight = state.right.controllerIds.includes(controllerId);
    const wasInSide = side === 'left' ? wasInLeft : wasInRight;

    // Start from copies and remove controller from BOTH teams
    const leftIds = state.left.controllerIds.filter(
      (id) => id !== controllerId,
    );
    const rightIds = state.right.controllerIds.filter(
      (id) => id !== controllerId,
    );

    // If the controller wasn't already in the target side, assign it there; otherwise toggle OFF
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

/** Running -> Paused */
const pause = transition('running', (state: PongRunningState): PongPaused => {
  return { game: 'pong', name: 'paused', frame: state.frame };
});

/** Paused -> Running */
const resume = transition('paused', (state: PongPaused): PongRunningState => {
  const frame = state.frame ?? snapshotFrame();
  // re-sync timing
  const now = performance.now();
  simEpoch = now - (frame?.simTime ?? tick * DT_MS);
  lastWallNow = now;
  accumulator = 0;
  return { game: 'pong', name: 'running', frame };
});

/** Running/Paused/Completed -> Preparing */
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

/** Running -> Completed */
const complete = transition('running', (state: PongRunningState): PongEnded => {
  return {
    game: 'pong',
    name: 'completed',
    frame: state.frame ?? snapshotFrame(),
  };
});

/** Imperative helper when score hits target */
function completeMatch() {
  complete(); // transition to completed
}

/** === State entry/exit side effects === */
onStateEntry('preparing', () => {
  showOverlay.value = true;
  overlayText.value = 'Click Start';
  // ensure there is at least one frame for renderer
  if (frames.length === 0) pushFrame(snapshotFrame());
});

onStateEntry('running', (state) => {
  showOverlay.value = false;
  overlayText.value = '';

  const now = performance.now();
  // if we transitioned from paused/preparing we must resync timing
  const baseSim = state.frame?.simTime ?? tick * DT_MS;
  simEpoch = now - baseSim;
  lastWallNow = now;
  accumulator = 0;

  // kick RAF
  rafId = requestAnimationFrame(frameLoop);
});

onStateExit('running', () => {
  cancelAnimationFrame(rafId);
});

onStateEntry('paused', () => {
  showOverlay.value = true;
  overlayText.value = 'Paused';
});

onStateEntry('completed', () => {
  showOverlay.value = true;
  overlayText.value = 'Game Over';
});

/** === Local controls that call transitions === */
function resetMatchInternals(opts: { keepScores: boolean }) {
  cancelAnimationFrame(rafId);
  tick = 0;
  frames.splice(0, frames.length);

  if (!opts.keepScores) {
    left.score = 0;
    right.score = 0;
  }

  left.paddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  right.paddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  resetBall();

  // push initial frame for renderer (even when not running)
  pushFrame(snapshotFrame());
}

/** Mount/unmount */
onMounted(() => {
  // seed a frame so the renderer has something to draw
  pushFrame(snapshotFrame());
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  // turn off any lights left on
  controllers.value.forEach((c) => c.setLight(false));
});
</script>
