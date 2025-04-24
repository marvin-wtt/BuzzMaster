import { watch, ref, inject } from 'vue';

function scaleVolume(x: number): number {
  const curveK = 9;

  return 1 - Math.log(1 + curveK * (1 - x)) / Math.log(1 + curveK);
}

export function useAudio() {
  const masterVolume = inject('masterVolume', ref(1.0));

  const audios: HTMLAudioElement[] = [];

  watch(masterVolume, () => {
    audios.forEach(updateVolume);
  });

  function updateVolume(audio: HTMLAudioElement) {
    audio.volume = scaleVolume(masterVolume.value);
  }

  function createAudio(src: string) {
    const audio = new Audio(src);
    updateVolume(audio);
    audios.push(audio);

    return audio;
  }

  function cloneAudio(audio: HTMLAudioElement) {
    const clone = audio.cloneNode(true) as HTMLAudioElement;
    updateVolume(clone);
    audios.push(clone);

    return clone;
  }

  return { createAudio, cloneAudio, masterVolume };
}
