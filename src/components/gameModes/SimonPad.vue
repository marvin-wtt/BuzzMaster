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
  --width: 220px;
  --bar-h: 54px;
  --gap: 14px;
  --radius: 18px;

  width: var(--width);
  pointer-events: none;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--gap);

  padding: 14px;
  border-radius: 22px;
  background: #0e0f12;

  box-shadow:
    0 18px 55px rgba(0, 0, 0, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.bar {
  height: var(--bar-h);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;

  /* calm default */
  filter: brightness(0.82) saturate(0.95);
  opacity: 0.92;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 -18px 28px rgba(0, 0, 0, 0.28);

  transition:
    filter 120ms ease,
    transform 120ms ease,
    opacity 120ms ease,
    box-shadow 120ms ease;
}

/* Active highlight: brighter + subtle outer glow */
.bar.active {
  opacity: 1;
  filter: brightness(1.55) saturate(1.25);
  transform: scale(1.02);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    inset 0 -18px 28px rgba(0, 0, 0, 0.16),
    0 0 0 6px rgba(255, 255, 255, 0.05),
    0 14px 40px rgba(0, 0, 0, 0.45);
}

/* Optional: if highlight is null, keep it extra calm */
.bar:not(.active) {
  transform: scale(1);
}
</style>
