import { MaybeRefOrGetter, onBeforeMount, Ref, toValue, watch } from 'vue';

export function useBeep(
  time: Ref<number>,
  startTime: MaybeRefOrGetter<number>,
  silent: MaybeRefOrGetter<boolean>,
) {
  const shortBeep = new Audio('sounds/beep-sec.mp3');
  const longBeep = new Audio('sounds/beep-end.mp3');

  onBeforeMount(() => {
    loadAudio();
  });

  const loadAudio = () => {
    shortBeep.load();
    longBeep.load();
  };

  watch(time, async (time, prevTime) => {
    if (toValue(silent)) {
      return;
    }

    if (time > toValue(startTime)) {
      return;
    }

    if (time <= 0 && prevTime > 0) {
      await longBeep.play();
    } else if (Math.ceil(time) < Math.ceil(prevTime)) {
      await shortBeep.play();
    }
  });
}
