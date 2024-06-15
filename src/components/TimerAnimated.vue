<template>
  <transition
    name="slide-fade"
    mode="out-in"
  >
    <a v-if="fade">
      {{ displayTime }}
    </a>
    <a v-else>
      {{ displayTime }}
    </a>
  </transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  time: number;
  animated?: boolean;
  precision?: number;
}

const props = withDefaults(defineProps<Props>(), {
  animated: false,
  precision: 0,
});

const displayTime = computed<string>(() => {
  const factor = Math.pow(10, props.precision);
  const seconds = Math.ceil(props.time * factor) / factor;

  return formatTime(seconds);
});

const fade = computed<boolean>(() => {
  return props.animated && Number(displayTime.value.slice(-1)) % 2 === 0;
});

const formatTime = (time: number) => {
  const date = new Date(time * 1000);

  let timeString = '';
  // Hours
  if (date.getUTCHours() > 0) {
    const hours = date.getUTCHours();
    timeString = `${hours}:`;
  }

  // Minutes
  if (date.getUTCMinutes() > 0 || timeString) {
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    timeString += `${minutes}:`;
  }

  // Seconds
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  timeString += `${seconds}`;

  // Milliseconds
  if (props.precision > 0) {
    const milliseconds = String(date.getUTCMilliseconds())
      .padStart(3, '0')
      .slice(0, props.precision);
    timeString += `.${milliseconds}`;
  }

  return timeString;
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
