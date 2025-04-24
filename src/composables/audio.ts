import { watch, ref } from 'vue';

const masterVolume = ref(0.75);

export function useAudio() {
  function createAudio(src: string) {
    const audio = new Audio(src);

    audio.volume = masterVolume.value;

    watch(masterVolume, (v) => {
      audio.volume = v;
    });

    return audio;
  }

  return { createAudio, masterVolume };
}
