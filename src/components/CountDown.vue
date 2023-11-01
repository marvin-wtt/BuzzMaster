<template>
  <transition
    name="slide-fade"
    mode="out-in"
  >
    <a v-if="seconds % 2">
      {{ seconds }}
    </a>
    <a v-else>
      {{ seconds }}
    </a>
  </transition>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';

interface Props {
  modelValue?: number;
  running?: boolean;
  time?: number;
  reverse?: boolean;
  updateRate?: number;
  beep?: boolean;
  beepStartTime?: number;
}

const props = withDefaults(defineProps<Props>(), {
  running: true,
  reverse: false,
  time: 10,
  updateRate: 10,
  beep: false,
  beepStartTime: 10,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const shortBeep = new Audio('sounds/beep-sec.mp3');
const longBeep = new Audio('sounds/beep-end.mp3');

watch(
  () => props.running,
  (value) => {
    // Always stop to make sure only one countdown is running
    stop();
    if (value) {
      start();
    }
  }
);

onBeforeMount(() => {
  if (props.running) {
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

const seconds = computed<number>(() => {
  return Math.ceil(time.value);
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
