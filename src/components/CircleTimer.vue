<template>
  <!-- TODO Can be replace by q-circular-progress -->
  <div class="base-timer">
    <svg
      class="base-timer__svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="base-timer__circle">
        <circle
          class="base-timer__path-elapsed"
          cx="50"
          cy="50"
          r="45"
        />
        <path
          :stroke-dasharray="strokeDashArray"
          :class="colorClass"
          class="base-timer__path-remaining"
          d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
        />
      </g>
    </svg>
    <span class="base-timer__label">
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  time: number;
  max: number;
  width?: string | number;
  infoClass?: string;
  warningClass?: string;
  warningThreshold?: number;
  alertClass?: string;
  alertThreshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: '5px',
  infoClass: 'text',
  warningClass: 'text-warning',
  warningThreshold: 5,
  alertClass: 'text-negative',
  alertThreshold: 3,
});

const colorClass = computed<string>(() => {
  if (time.value <= props.alertThreshold) {
    return props.alertClass;
  }
  if (time.value <= props.warningThreshold) {
    return props.warningClass;
  }

  return props.infoClass;
});

const time = computed<number>(() => {
  return Math.ceil(props.time);
});

const timeFraction = computed(() => {
  const rawTimeFraction = time.value / props.max;
  return rawTimeFraction - (1 / props.max) * (1 - rawTimeFraction);
});

const strokeDashArray = computed(() => {
  return `${(timeFraction.value * 283).toFixed(0)} 283`;
});
</script>

<style lang="scss" scoped>
.base-timer {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
}

.base-timer__svg {
  transform: scaleX(-1);
}

.base-timer__circle {
  fill: none;
  stroke: none;
}

.base-timer__path-elapsed {
  stroke-width: v-bind(width);
  stroke: grey;
}

.base-timer__path-remaining {
  stroke-width: v-bind(width);
  stroke-linecap: round;
  transform: rotate(90deg);
  transform-origin: center;
  transition: 1s linear all;
  fill-rule: nonzero;
  stroke: currentColor;
}

.base-timer__label {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
