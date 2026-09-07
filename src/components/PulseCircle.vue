<template>
  <div
    class="circle"
    :class="pulseClass"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  pulse: boolean;
}

const props = defineProps<Props>();

const pulseClass = computed<string>(() => {
  return props.pulse ? 'pulse' : '';
});
</script>

<style lang="scss" scoped>
$pulseMin: 0.95;
$pulseMax: 1;

.circle {
  margin: 15px;
  border-radius: 50%;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--bm-line-strong);
  background: var(--bm-surface);
  color: var(--bm-dim);
}

/* While the question is open the ring breathes in the accent colour — the one
   thing on screen that says "we are live". */
.pulse {
  border-color: var(--bm-accent);
  color: var(--bm-ink);
  animation: t-pulse 2s infinite;
}

.pulse * {
  animation: pulse-inverse 2s infinite;
}

@keyframes pulse-inverse {
  0% {
    transform: scale(calc(1 / $pulseMin));
  }

  70% {
    transform: scale(calc(1 / $pulseMax));
  }

  100% {
    transform: scale(calc(1 / $pulseMin));
  }
}

@keyframes t-pulse {
  0% {
    transform: scale($pulseMin);
    box-shadow: 0 0 0 0 var(--bm-accent-soft);
  }

  70% {
    transform: scale($pulseMax);
    box-shadow: 0 0 0 14px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale($pulseMin);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
