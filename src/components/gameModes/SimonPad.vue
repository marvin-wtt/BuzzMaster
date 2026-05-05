<template>
  <div
    class="stack-pad"
    role="img"
  >
    <div class="stack">
      <div
        v-for="button in buttons"
        :key="button"
        class="bar"
        :class="[buttonColor(button), highlight === button ? 'active' : '']"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BuzzerButton } from 'src/plugins/buzzer/types';

const { highlight = null, buttons } = defineProps<{
  buttons?: readonly BuzzerButton[] | undefined;
  highlight?: BuzzerButton | null | undefined;
}>();

function buttonColor(button: BuzzerButton): string {
  switch (button) {
    case BuzzerButton.BLUE:
      return 'bar--blue';
    case BuzzerButton.ORANGE:
      return 'bar--orange';
    case BuzzerButton.GREEN:
      return 'bar--green';
    case BuzzerButton.YELLOW:
      return 'bar--yellow';
    case BuzzerButton.RED:
      return 'bar--red';
  }
}
</script>

<style scoped>
.stack-pad {
  --width: 240px;
  --bar-h: 56px;
  --gap: 10px;
  --radius: 16px;

  width: var(--width);
  pointer-events: none;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--gap);

  padding: 14px;
  border-radius: 24px;

  background: linear-gradient(160deg, #17181f 0%, #0c0d11 100%);

  box-shadow:
    0 24px 72px rgba(0, 0, 0, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -2px 0 rgba(0, 0, 0, 0.5);
}

/* ── Bar base ───────────────────────────────────── */

.bar {
  height: var(--bar-h);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;

  filter: brightness(0.72) saturate(0.85);

  box-shadow: inset 0 -12px 20px rgba(0, 0, 0, 0.35);

  transition:
    filter 130ms ease,
    transform 130ms ease,
    box-shadow 130ms ease;
}

/* Top-left gloss */
.bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    130deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.05) 28%,
    rgba(255, 255, 255, 0) 55%
  );
  pointer-events: none;
}

/* ── Colors ─────────────────────────────────────── */

.bar--blue {
  background: #1565c0;
  --glow: rgba(33, 150, 243, 0.65);
}
.bar--orange {
  background: #e65100;
  --glow: rgba(255, 138, 0, 0.65);
}
.bar--green {
  background: #2e7d32;
  --glow: rgba(76, 175, 80, 0.65);
}
.bar--yellow {
  background: #f9a825;
  --glow: rgba(255, 224, 50, 0.65);
}
.bar--red {
  background: #b71c1c;
  --glow: rgba(244, 67, 54, 0.65);
}

/* ── Active ─────────────────────────────────────── */

.bar.active {
  filter: brightness(1.6) saturate(1.3);
  transform: scaleY(1.04);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 0 28px 4px var(--glow);
}

.bar.active::before {
  opacity: 1.5;
}

/* Dim inactive bars while one is lit */
.stack:has(.bar.active) .bar:not(.active) {
  filter: brightness(0.48) saturate(0.6);
}
</style>
