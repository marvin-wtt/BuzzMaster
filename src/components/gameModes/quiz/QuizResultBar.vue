<template>
  <div class="column justify-between no-wrap text-center">
    <div
      class="q-pb-sm bar-value"
      :style="animationDurationStyle"
    >
      {{ props.percentage }} %
    </div>

    <div class="col-grow column justify-end">
      <div
        class="bar text-center"
        :style="barStyle"
      >
        <div
          class="inner"
          :class="colorClass"
          :style="animationDurationStyle"
        />
      </div>
    </div>
    <div
      class="bar-value"
      :style="animationDurationStyle"
    >
      {{ props.total }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { computed, StyleValue } from 'vue';

const props = defineProps<{
  button: BuzzerButton;
  percentage: number;
  total: number;
  animated?: boolean;
}>();

const MAX_ANIMATION_DURATION = 2;

const animationDurationStyle = computed<StyleValue>(() => {
  const duration = props.animated
    ? (props.percentage / 100) * MAX_ANIMATION_DURATION
    : 0;

  return {
    animationDuration: `${duration}s`,
  };
});

const barStyle = computed<StyleValue>(() => {
  const height = props.total > 0 ? props.percentage : 0.1;

  return {
    height: `${height}%`,
  };
});

const colorClass = computed<string>(() => {
  return buzzerButtonBgColor[props.button];
});

const buzzerButtonBgColor = {
  [BuzzerButton.BLUE]: 'bg-blue',
  [BuzzerButton.ORANGE]: 'bg-orange',
  [BuzzerButton.GREEN]: 'bg-green',
  [BuzzerButton.YELLOW]: 'bg-yellow',
  [BuzzerButton.RED]: 'bg-grey',
};
</script>

<style scoped>
.bar {
  width: 50px;
  margin: 0 10px;
  position: relative;
}

.bar .inner {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  animation-name: growBar;
  animation-timing-function: linear;
  position: absolute;
  bottom: 0;
}

.bar-value {
  opacity: 1;
  animation-name: fadeIn;
  animation-timing-function: linear;
}

@keyframes growBar {
  from {
    height: 0;
  }

  to {
    height: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  0% {
    opacity: 0;
  }

  99% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
