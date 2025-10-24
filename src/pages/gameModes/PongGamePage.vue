<template>
  <q-page>
    <div class="column items-center text-white q-pa-sm">
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
          v-if="!running"
          color="primary"
          label="Start Game"
          rounded
          @click="startGame"
        />
        <q-btn
          v-else
          color="primary"
          label="Pause Game"
          rounded
          @click="togglePause"
        />
        <q-btn
          flat
          color="grey-5"
          label="Reset"
          rounded
          @click="resetMatch"
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

const { controllers } = useBuzzer();

onMounted(() => {
  // seed a frame so the renderer has something to draw
  pushFrame(snapshotFrame());
});
onUnmounted(() => {
  cancelAnimationFrame(rafId);
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

/** Timing: fixed-step sim at 120 Hz; render with small delay for interpolation */
const SIM_HZ = 120;
const DT_MS = 1000 / SIM_HZ; // ~8.33 ms
const BUFFER_MS = 70; // render “behind” latest sim time

/** Authoritative state */
let running = false;
let tick = 0;
let simEpoch = 0; // wall clock ms when sim started
let accumulator = 0;
let rafId = 0;
let lastWallNow = 0;

const left: Team = reactive({
  controllerIds: [controllers.value[0]!.id], // fill based on your app’s team assignment
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
  controllerIds: [controllers.value[1]!.id],
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
  vx: BALL_START_SPEED * (Math.random() > 0.5 ? 1 : -1),
  vy: (Math.random() - 0.5) * 6,
  radius: 8,
  speed: BALL_START_SPEED,
});

/** UI overlay */
const showOverlay = ref(true);
const overlayText = ref('Click Start');

/** Interpolation buffer (ring) */
const frames: StageFrame[] = reactive([]);
const MAX_FRAMES = 256;

function snapshotFrame(): StageFrame {
  return {
    tick,
    simTime: tick * DT_MS,
    left: { score: left.score, paddle: { ...left.paddle } },
    right: { score: right.score, paddle: { ...right.paddle } },
    ball: { ...ball },
  };
}
function pushFrame(frame: StageFrame) {
  frames.push(frame);
  while (frames.length > MAX_FRAMES) {
    frames.shift();
  }
}

/** Interp selection */
const interp = computed(() => {
  const now = performance.now();
  const renderSimTime = Math.max(0, now - simEpoch - BUFFER_MS);

  if (frames.length === 0) {
    return { frameA: null, frameB: null, renderSimTime };
  }

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

/** Helpers */
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
  if (isLeft) {
    ball.x = p.x + p.width + ball.radius;
  } else {
    ball.x = p.x - ball.radius;
  }

  const pCenter = p.y + p.height / 2;
  const collide = (ball.y - pCenter) / (p.height / 2); // [-1..1]
  const angle = MAX_BOUNCE_ANGLE * clamp(collide, -1, 1);
  const direction = isLeft ? 1 : -1;

  ball.speed = Math.min(ball.speed * 1.05, MAX_BALL_SPEED);
  ball.vx = direction * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);
}

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

  // Bookkeeping
  tick++;
  pushFrame(snapshotFrame());
}

/** Fixed-step loop */
function frameLoop(now: number) {
  if (!running) return;
  const elapsed = now - lastWallNow;
  lastWallNow = now;
  accumulator += elapsed;

  while (accumulator >= DT_MS) {
    stepOnce();
    accumulator -= DT_MS;
  }
  rafId = requestAnimationFrame(frameLoop);
}

/** Controls */
function startGame() {
  if (running) {
    return;
  }
  running = true;
  showOverlay.value = false;
  overlayText.value = '';
  if (frames.length === 0) {
    pushFrame(snapshotFrame());
  }

  const now = performance.now();
  simEpoch = now - tick * DT_MS;
  lastWallNow = now;
  accumulator = 0;

  rafId = requestAnimationFrame(frameLoop);
}
function togglePause() {
  if (!running) {
    startGame();
    return;
  }
  running = false;
  showOverlay.value = true;
  overlayText.value = 'Paused';
  cancelAnimationFrame(rafId);
}
function resetMatch() {
  running = false;
  cancelAnimationFrame(rafId);
  tick = 0;
  frames.splice(0, frames.length);
  left.score = 0;
  right.score = 0;
  left.paddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  right.paddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  resetBall();
  pushFrame(snapshotFrame());
  showOverlay.value = true;
  overlayText.value = 'Click Start';
}
</script>
