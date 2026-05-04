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
      return 'bg-blue';
    case BuzzerButton.ORANGE:
      return 'bg-orange';
    case BuzzerButton.GREEN:
      return 'bg-green';
    case BuzzerButton.YELLOW:
      return 'bg-yellow';
    case BuzzerButton.RED:
      return 'bg-red';
  }
}
</script>

<style scoped>
.stack-pad {
  --width: 240px;
  --bar-h: 56px;
  --gap: 14px;
  --radius: 18px;

  width: var(--width);
  pointer-events: none;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--gap);

  padding: 16px;
  border-radius: 26px;

  background:
    radial-gradient(
      circle at 30% 20%,
      rgba(255, 255, 255, 0.06),
      transparent 55%
    ),
    linear-gradient(180deg, #12131a, #0b0c10);

  box-shadow:
    0 20px 65px rgba(0, 0, 0, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    inset 0 10px 22px rgba(255, 255, 255, 0.03),
    inset 0 -18px 28px rgba(0, 0, 0, 0.45);
}

.bar {
  height: var(--bar-h);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;

  filter: brightness(0.78) saturate(0.95);
  opacity: 0.92;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 -18px 28px rgba(0, 0, 0, 0.3);

  transition:
    filter 120ms ease,
    transform 120ms ease,
    opacity 120ms ease,
    box-shadow 120ms ease;
}

.bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.22),
    rgba(255, 255, 255, 0.07) 22%,
    rgba(255, 255, 255, 0) 58%
  );
  opacity: 0.5;
  transform: translateX(-14%);
  pointer-events: none;
}

.bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.035) 0px,
    rgba(255, 255, 255, 0.035) 1px,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0) 6px
  );
  opacity: 0.1;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.bar.active {
  opacity: 1;
  filter: brightness(1.55) saturate(1.25);
  transform: scale(1.02);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    inset 0 -18px 28px rgba(0, 0, 0, 0.16),
    0 10px 34px rgba(0, 0, 0, 0.45);
}

.bar.active::before {
  opacity: 0.7;
}

.stack:has(.bar.active) .bar:not(.active) {
  filter: brightness(0.72) saturate(0.9);
  opacity: 0.86;
}

.bar:not(.active) {
  transform: scale(1);
}
</style>
