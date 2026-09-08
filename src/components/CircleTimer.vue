<template>
  <q-circular-progress
    :value="time"
    :max
    :color
    :thickness
    show-value
    :animation-speed="10"
    class="circle-timer"
  >
    <slot />
  </q-circular-progress>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const {
  time,
  max,
  thickness = 0.1,
  infoColor = 'text',
  warningColor = 'warning',
  warningThreshold = 5,
  alertColor = 'negative',
  alertThreshold = 3,
} = defineProps<{
  time: number;
  max: number;
  thickness?: number;
  infoColor?: string;
  warningColor?: string;
  warningThreshold?: number;
  alertColor?: string;
  alertThreshold?: number;
}>();

const color = computed<string>(() => {
  if (time <= alertThreshold) {
    return alertColor;
  }
  if (time <= warningThreshold) {
    return warningColor;
  }

  return infoColor;
});
</script>

<style scoped>
/*
 * Fills the parent by default but stays overridable: `.fit` uses `!important`
 * and would silently discard any width/height set by the caller.
 */
.circle-timer {
  width: 100%;
  height: 100%;
}
</style>
