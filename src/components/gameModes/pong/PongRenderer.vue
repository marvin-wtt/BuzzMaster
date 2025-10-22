<template>
  <div class="canvas-wrapper">
    <canvas
      ref="canvas"
      :width="`${width}px`"
      :height="`${height}px`"
      class="pong-canvas"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { StageFrame } from 'components/gameModes/pong/PongTypes';

const {
  frameA,
  frameB,
  renderSimTime,
  width = 800,
  height = 500,
} = defineProps<{
  width: number;
  height: number;
  frameA: StageFrame | null;
  frameB: StageFrame | null;
  renderSimTime: number; // target sim time to render (ms)
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null;
  draw(); // initial clear
});

// Re-render when frames or target time change.
// Note: this is a "pull to draw" component; parent controls cadence.
watch(() => [frameA?.tick, frameB?.tick, renderSimTime, width, height], draw, {
  flush: 'sync',
});

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function draw() {
  if (!ctx) return;
  const W = width;
  const H = height;
  const tR = renderSimTime;

  // background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, W, H);

  // dashed midline
  ctx.strokeStyle = '#444';
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!frameA) return;

  const A = frameA;
  const B = frameB ?? frameA;

  // compute interpolation weight
  const tA = A.simTime;
  const tB = Math.max(B.simTime, tA); // guard against identical or out-of-order times
  let w = tB > tA ? (tR - tA) / (tB - tA) : 0;
  // Allow tiny extrapolation window (e.g., up to 16 ms) for smoothness
  const maxExtrapolateMs = 16;
  if (w > 1 && tR - tB <= maxExtrapolateMs) {
    // linear extrapolation from B using velocity if available
    w = 1;
  } else {
    w = clamp01(w);
  }

  // interpolate paddles
  const lp = {
    x: lerp(A.left.paddle.x, B.left.paddle.x, w),
    y: lerp(A.left.paddle.y, B.left.paddle.y, w),
    w: A.left.paddle.width, // sizes don’t change in Pong
    h: A.left.paddle.height,
  };
  const rp = {
    x: lerp(A.right.paddle.x, B.right.paddle.x, w),
    y: lerp(A.right.paddle.y, B.right.paddle.y, w),
    w: A.right.paddle.width,
    h: A.right.paddle.height,
  };

  // interpolate ball (prefer positions; velocities only used for tiny extrapolation)
  let bx = lerp(A.ball.x, B.ball.x, w);
  let by = lerp(A.ball.y, B.ball.y, w);

  if (tR > tB && tR - tB <= maxExtrapolateMs) {
    const dt = (tR - tB) / 1000;
    bx += B.ball.vx * dt;
    by += B.ball.vy * dt;
  }

  // draw paddles & ball
  ctx.fillStyle = 'white';
  ctx.fillRect(lp.x, lp.y, lp.w, lp.h);
  ctx.fillRect(rp.x, rp.y, rp.w, rp.h);
  ctx.beginPath();
  ctx.arc(bx, by, A.ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // draw scores (stepwise from the latest known frame)
  const scoreFrame = tR >= B.simTime ? B : A;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(String(scoreFrame.left.score), W / 2 - 50, 50);
  ctx.fillText(String(scoreFrame.right.score), W / 2 + 50, 50);
}
</script>

<style scoped>
.canvas-wrapper {
  width: 90vw;
  max-width: 800px;
  aspect-ratio: 8 / 5;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pong-canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  border-radius: 0.5rem;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}
</style>
