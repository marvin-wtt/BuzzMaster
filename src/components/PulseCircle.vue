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

  box-shadow: 0 0 0 1px;
}

.pulse {
  animation: t-pulse 2s infinite;
}

.pulse * {
  animation: pulse-inverse 2s infinite;
}

@keyframes pulse-inverse {
  0% {
    transform: scale(1 / $pulseMin);
  }

  70% {
    transform: scale(1 / $pulseMax);
  }

  100% {
    transform: scale(1 / $pulseMin);
  }
}

@keyframes t-pulse {
  0% {
    transform: scale($pulseMin);
    box-shadow: 0 0 0 0;
  }

  70% {
    transform: scale($pulseMax);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale($pulseMin);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
