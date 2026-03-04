<template>
  <div
    class="memory-pad"
    role="img"
    aria-label="Color memory pad"
  >
    <div class="pad">
      <div
        v-for="button in buttons"
        :key="button"
        class="segment"
        :class="[buttonColor(button), highlight === button ? 'active' : '']"
      />

      <div class="center">
        <div
          class="timer"
          :class="{ 'timer--hidden': timer === undefined }"
        >
          {{ timerText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';

const {
  highlight = null,
  buttons,
  timer,
} = defineProps<{
  buttons?: readonly BuzzerButton[] | undefined;
  highlight?: BuzzerButton | null | undefined;
  timer?: number | undefined; // display only; logic outside
}>();

function buttonColor(button: BuzzerButton): string {
  switch (button) {
    case BuzzerButton.BLUE:
      return 'blue';
    case BuzzerButton.ORANGE:
      return 'orange';
    case BuzzerButton.GREEN:
      return 'green';
    case BuzzerButton.YELLOW:
      return 'yellow';
    case BuzzerButton.RED:
      return 'red';
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

const timerText = computed(() => {
  if (timer === undefined) {
    return '—-:--';
  }

  const total = Math.max(0, Math.floor(timer));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
});
</script>

<style scoped>
/* Display-only component */
.memory-pad {
  --size: 320px;

  /* geometry */
  --gap: 14px; /* thickness of cross gap */
  --inset: 14px; /* distance from outer ring */
  --ring: 12px; /* outer ring thickness */
  --center: 124px; /* center hole diameter */

  width: var(--size);
  height: var(--size);
  display: grid;
  place-items: center;
  pointer-events: none;
}

/* outer ring + subtle depth */
.pad {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #0e0f12;

  box-shadow:
    0 18px 55px rgba(0, 0, 0, 0.55),
    inset 0 0 0 var(--ring) rgba(255, 255, 255, 0.06),
    inset 0 0 0 calc(var(--ring) + 2px) rgba(0, 0, 0, 0.35);
}

/* cross gap (real separation) */
.pad::before,
.pad::after {
  content: '';
  position: absolute;
  z-index: 5;
  background: #0e0f12;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
.pad::before {
  top: 0;
  bottom: 0;
  width: var(--gap);
  left: 50%;
  transform: translateX(-50%);
}
.pad::after {
  left: 0;
  right: 0;
  height: var(--gap);
  top: 50%;
  transform: translateY(-50%);
}

/* segments */
.segment {
  position: absolute;
  inset: var(--inset);
  border-radius: 50%;
  transition:
    transform 120ms ease,
    filter 120ms ease,
    opacity 120ms ease;

  /* modern sheen */
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 -18px 28px rgba(0, 0, 0, 0.3);
  filter: saturate(0.95) brightness(0.86);
  opacity: 0.92;
}

/* clockwise order: blue → orange → green → yellow
   top-left, top-right, bottom-right, bottom-left */
.blue {
  background:
    radial-gradient(
      circle at 28% 28%,
      rgba(255, 255, 255, 0.35),
      transparent 42%
    ),
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent 40%), #1e88e5;
  clip-path: polygon(0 0, 50% 0, 50% 50%, 0 50%);
}
.orange {
  background:
    radial-gradient(
      circle at 72% 28%,
      rgba(255, 255, 255, 0.35),
      transparent 42%
    ),
    linear-gradient(215deg, rgba(255, 255, 255, 0.08), transparent 40%), #fb8c00;
  clip-path: polygon(50% 0, 100% 0, 100% 50%, 50% 50%);
}
.green {
  background:
    radial-gradient(
      circle at 72% 72%,
      rgba(255, 255, 255, 0.28),
      transparent 42%
    ),
    linear-gradient(315deg, rgba(255, 255, 255, 0.08), transparent 40%), #43a047;
  clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%);
}
.yellow {
  background:
    radial-gradient(
      circle at 28% 72%,
      rgba(255, 255, 255, 0.28),
      transparent 42%
    ),
    linear-gradient(35deg, rgba(255, 255, 255, 0.08), transparent 40%), #fdd835;
  clip-path: polygon(0 50%, 50% 50%, 50% 100%, 0 100%);
}

/* active segment: modern neon pop */
.segment.active {
  opacity: 1;
  filter: brightness(1.55) saturate(1.25);
  transform: translateZ(0) scale(1.01);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    inset 0 -18px 28px rgba(0, 0, 0, 0.18),
    0 0 0 6px rgba(255, 255, 255, 0.06),
    0 12px 40px rgba(0, 0, 0, 0.45);
}

/* center “hole” with timer */
.center {
  position: absolute;
  z-index: 8;
  width: var(--center);
  height: var(--center);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  border-radius: 50%;
  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.1),
      transparent 55%
    ),
    #0b0c0f;

  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.55),
    inset 0 0 0 10px rgba(255, 255, 255, 0.04),
    inset 0 0 0 12px rgba(0, 0, 0, 0.55);

  display: grid;
  place-items: center;
}

.timer {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
}

.timer--hidden {
  opacity: 0.35;
}
</style>
