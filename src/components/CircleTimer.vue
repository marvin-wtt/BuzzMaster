<template>
  <q-circular-progress
    :value="time"
    :max
    :color
    :thickness
    show-value
    :animation-speed="600"
    class="fit"
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

<style scoped></style>
