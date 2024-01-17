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
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';

interface Props {
  modelValue?: number;
  paused?: boolean;
  time?: number;
  reverse?: boolean;
  updateRate?: number;
  beep?: boolean;
  beepStartTime?: number;
  precision?: number;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  paused: false,
  reverse: false,
  time: 10,
  updateRate: 10,
  beep: false,
  beepStartTime: 10,
  precision: 0,
  animated: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const shortBeep = new Audio('sounds/beep-sec.mp3');
const longBeep = new Audio('sounds/beep-end.mp3');

watch(
  () => props.paused,
  (paused) => {
    // Always stop to make sure only one countdown is running
    stop();
    if (!paused) {
      start();
    }
  }
);

onBeforeMount(() => {
  if (!props.paused) {
    start();
    value.value = props.time ?? 0;
  }

  loadAudio();
});

onUnmounted(() => {
  stop();
});

const time = computed<number>(() => {
  return props.modelValue ?? value.value;
});

const value = ref<number>(0);
let intervalId: NodeJS.Timeout | undefined;

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
};

const start = () => {
  const timeout = 1000 / props.updateRate;
  const interval = 1 / props.updateRate;

  intervalId = setInterval(() => {
    if (time.value <= 0) {
      stop();

      if (props.beep) {
        longBeep.play();
      }

      return;
    }

    const nextTime = time.value - interval * (props.reverse ? -1 : 1);

    // Only beep on falling flanks. Flanks from one to zero need to ignored as it is already the last one
    if (
      props.beep &&
      nextTime <= props.beepStartTime &&
      nextTime > 0 &&
      Math.ceil(nextTime) < time.value
    ) {
      shortBeep.play();
    }

    value.value = nextTime;
    emit('update:modelValue', nextTime);
  }, timeout);
};

const formatTime = (time: number) => {
  const date = new Date(time * 1000);

  // Seconds
  let timeString = '';

  // Minutes
  if (date.getUTCMinutes() > 0) {
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    timeString = `${minutes}:`;
  }

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
