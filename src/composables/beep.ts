import {
  type MaybeRefOrGetter,
  onBeforeMount,
  type Ref,
  toValue,
  watch,
} from 'vue';
import { useAudio } from 'src/composables/audio';

export function useBeep(
  time: Ref<number>,
  startTime: MaybeRefOrGetter<number>,
  silent: MaybeRefOrGetter<boolean>,
) {
  const { createAudio } = useAudio();

  const shortBeep = createAudio('sounds/beep-sec.mp3');
  const longBeep = createAudio('sounds/beep-end.mp3');

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
