<template><div style="display: none" /></template>

<script lang="ts" setup>
import { onBeforeMount, watch } from 'vue';
import { useAudio } from 'src/composables/audio';

const { createAudio } = useAudio();

interface Props {
  time: number;
  silent?: boolean;
  startAt?: number;
}

const props = withDefaults(defineProps<Props>(), {
  silent: false,
  startAt: 10,
});

const shortBeep = createAudio('sounds/beep-sec.mp3');
const longBeep = createAudio('sounds/beep-end.mp3');

onBeforeMount(() => {
  loadAudio();
});

const loadAudio = () => {
  shortBeep.load();
  longBeep.load();
};

watch(
  () => props.time,
  async (time, prevTime) => {
    if (props.silent) {
      return;
    }

    if (time > props.startAt) {
      return;
    }

    if (time <= 0 && prevTime > 0) {
      await longBeep.play();
    } else if (Math.ceil(time) < Math.ceil(prevTime)) {
      await shortBeep.play();
    }
  },
);
</script>
