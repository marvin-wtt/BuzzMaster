<template>
  <div
    ref="wrapper"
    class="canvas-wrapper"
    :class="{ 'full-width': fullWidth }"
  >
    <canvas
      ref="canvas"
      :width="WIDTH"
      :height="HEIGHT"
      class="pong-canvas"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import type { StageFrame } from 'components/gameModes/pong/PongTypes';

const {
  frameA,
  frameB,
  renderSimTime,
  leftColor = '#2196f3',
  rightColor = '#ff9800',
  fullWidth = false,
} = defineProps<{
  frameA: StageFrame | null;
  frameB: StageFrame | null;
  renderSimTime: number;
  leftColor?: string;
  rightColor?: string;
  fullWidth?: boolean;
}>();

const WIDTH = 800;
const HEIGHT = 500;

const wrapper = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let rafId: number | null = null;

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null;
  const loop = () => {
    draw();
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
});

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function draw() {
  if (!ctx) return;
  const W = WIDTH;
  const H = HEIGHT;
  const tR = renderSimTime;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Center divider
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!frameA) return;

  const A = frameA;
  const B = frameB ?? frameA;

  const tA = A.simTime;
  const tB = Math.max(B.simTime, tA);
  const maxExtrapolateMs = 16;
  let w = tB > tA ? (tR - tA) / (tB - tA) : 0;
  if (w > 1 && tR - tB <= maxExtrapolateMs) {
    w = 1;
  } else {
    w = clamp01(w);
  }

  const lp = {
    x: lerp(A.left.paddle.x, B.left.paddle.x, w),
    y: lerp(A.left.paddle.y, B.left.paddle.y, w),
    w: A.left.paddle.width,
    h: A.left.paddle.height,
  };
  const rp = {
    x: lerp(A.right.paddle.x, B.right.paddle.x, w),
    y: lerp(A.right.paddle.y, B.right.paddle.y, w),
    w: A.right.paddle.width,
    h: A.right.paddle.height,
  };

  let bx = lerp(A.ball.x, B.ball.x, w);
  let by = lerp(A.ball.y, B.ball.y, w);
  if (tR > tB && tR - tB <= maxExtrapolateMs) {
    const dt = (tR - tB) / 1000;
    bx += B.ball.vx * dt;
    by += B.ball.vy * dt;
  }

  const lRgb = hexToRgb(leftColor);
  const rRgb = hexToRgb(rightColor);

  // Left paddle with glow
  ctx.shadowBlur = 14;
  ctx.shadowColor = leftColor;
  ctx.fillStyle = leftColor;
  roundRect(ctx, lp.x, lp.y, lp.w, lp.h, 3);
  ctx.fill();

  // Right paddle with glow
  ctx.shadowColor = rightColor;
  ctx.fillStyle = rightColor;
  roundRect(ctx, rp.x, rp.y, rp.w, rp.h, 3);
  ctx.fill();

  // Ball with glow
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(bx, by, A.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Scores
  const scoreFrame = tR >= B.simTime ? B : A;
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.fillStyle = `rgba(${lRgb}, 0.9)`;
  ctx.fillText(String(scoreFrame.left.score), W / 2 - 70, 16);

  ctx.fillStyle = `rgba(${rRgb}, 0.9)`;
  ctx.fillText(String(scoreFrame.right.score), W / 2 + 70, 16);
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}
</script>

<style scoped>
/* Game page: constrained by both viewport width and height minus surrounding UI */
.canvas-wrapper {
  width: min(90vw, calc((100vh - 180px) * 1.6), 800px);
  aspect-ratio: 8 / 5;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Cast window: fill viewport minus the 64px score header */
.canvas-wrapper.full-width {
  width: min(100vw, calc((100vh - 64px) * 1.6));
  max-width: none;
}

.pong-canvas {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.6);
}
</style>
