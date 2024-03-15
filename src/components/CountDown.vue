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
import { computed, onBeforeMount, onUnmounted, watch } from 'vue';

interface Props {
  paused?: boolean;
  reverse?: boolean;
  updateRate?: number;
  beep?: boolean;
  beepStartTime?: number;
  precision?: number;
  animated?: boolean;
}

const time = defineModel<number>({
  default: 0,
});

const props = withDefaults(defineProps<Props>(), {
  paused: false,
  reverse: false,
  updateRate: 10,
  beep: false,
  beepStartTime: 10,
  precision: 0,
  animated: false,
});

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'stop'): void;
}>();

const shortBeep = new Audio('sounds/beep-sec.mp3');
const longBeep = new Audio('sounds/beep-end.mp3');
let intervalId: NodeJS.Timeout | undefined;

watch([props.paused, props.reverse], ([paused]) => {
  // Always stop to make sure only one countdown is running
  stop();
  if (!paused) {
    start();
  }
});

onBeforeMount(() => {
  loadAudio();

  if (!props.paused) {
    start();
  }
});

onUnmounted(() => {
  stop();
});

const displayTime = computed<string>(() => {
  const factor = Math.pow(10, props.precision);
  const seconds = Math.ceil(time.value * factor) / factor;

  return formatTime(seconds);
});

const fade = computed<boolean>(() => {
  return props.animated && Number(displayTime.value.slice(-1)) % 2 === 0;
});

const loadAudio = () => {
  shortBeep.load();
  longBeep.load();
};

const stop = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = undefined;
  emit('stop');
};

const start = () => {
  const timeout = 1000 / props.updateRate;
  const interval = 1 / props.updateRate;

  const initialTime = time.value;
  const startTimestamp = new Date().getTime();
  const reverse = props.reverse ? -1 : 1;

  intervalId = setInterval(() => {
    if (time.value <= 0 && !props.reverse) {
      stop();

      if (props.beep) {
        longBeep.play();
      }

      return;
    }

    const nextTime = time.value - interval * reverse;

    // Only beep on falling flanks. Flanks from one to zero need to ignored as it is already the last one
    if (
      props.beep &&
      nextTime <= props.beepStartTime &&
      nextTime > 0 &&
      Math.ceil(nextTime) < time.value
    ) {
      shortBeep.play();
    }

    const now = new Date().getTime();
    const elapsedTime = now - startTimestamp;

    time.value = initialTime - elapsedTime * reverse;
  }, timeout);

  emit('start');
};

const formatTime = (time: number) => {
  const date = new Date(time * 1000);

  let timeString = '';

  // Minutes
  if (date.getUTCMinutes() > 0) {
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    timeString = `${minutes}:`;
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
