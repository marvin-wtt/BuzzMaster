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

  function initAudio(audio: HTMLAudioElement) {
    audio.addEventListener('ended', () => {
      removeAudio(audio);
    });

    audio.addEventListener('play', () => {
      updateVolume(audio);
      addAudio(audio);
    });
  }

  function createAudio(src: string) {
    const audio = new Audio(src);
    initAudio(audio);

    return audio;
  }

  function cloneAudio(audio: HTMLAudioElement) {
    const clone = audio.cloneNode(true) as HTMLAudioElement;
    initAudio(clone);

    return clone;
  }

  function addAudio(audio: HTMLAudioElement) {
    const index = audios.indexOf(audio);
    if (index === -1) {
      audios.push(audio);
    }
  }

  function removeAudio(audio: HTMLAudioElement) {
    const index = audios.indexOf(audio);
    if (index > -1) {
      audios.splice(index, 1);
    }
  }

  return { createAudio, cloneAudio, masterVolume };
}
