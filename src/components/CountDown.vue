<template>
  <transition
    name="slide-fade"
    mode="out-in"
  >
    {{ seconds }}
  </transition>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';

interface Props {
  modelValue: number;
  running: boolean;
  reverse?: boolean;
  updateRate?: number;
}

const props = withDefaults(defineProps<Props>(), {
  reverse: false,
  updateRate: 10,
});

const emit = defineEmits<{
  (e: 'modelValue:update', value: number): void;
}>();

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

const seconds = computed<number>(() => {
  return Math.ceil(props.modelValue);
});

let intervalId: NodeJS.Timeout | undefined;

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
    emit('modelValue:update', props.modelValue + interval);

    if (props.modelValue === 0) {
      stop();
    }
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
