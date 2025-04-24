import { watch, ref, inject } from 'vue';

function scaleVolume(x: number): number {
  const curveK = 9;

  return 1 - Math.log(1 + curveK * (1 - x)) / Math.log(1 + curveK);
}

export function useAudio() {
  const masterVolume = inject('masterVolume', ref(1.0));

  function createAudio(src: string) {
    const audio = new Audio(src);

    audio.volume = scaleVolume(masterVolume.value);

    watch(masterVolume, (v) => {
      audio.volume = scaleVolume(v);
    });

    return audio;
  }

  return { createAudio, masterVolume };
}
