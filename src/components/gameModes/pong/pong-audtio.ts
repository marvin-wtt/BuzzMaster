import { onUnmounted } from 'vue';

export function usePongAudio() {
  let audioCtx: AudioContext | null = null;

  onUnmounted(() => {
    audioCtx?.close().catch((error) => console.error(error));
  });

  function getAudioCtx(): AudioContext {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  }

  function playPaddleHit() {
    try {
      const c = getAudioCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = 480;
      g.gain.setValueAtTime(0.12, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.06);
    } catch {
      // ignore audio errors
    }
  }

  function playWallHit() {
    try {
      const c = getAudioCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = 240;
      g.gain.setValueAtTime(0.08, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.05);
    } catch {
      // ignore audio errors
    }
  }

  function playScore() {
    try {
      const c = getAudioCtx();
      [440, 550, 660].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.frequency.value = freq;
        const st = c.currentTime + i * 0.1;
        g.gain.setValueAtTime(0.18, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.15);
        osc.start(st);
        osc.stop(st + 0.15);
      });
    } catch {
      // ignore audio errors
    }
  }

  function playGameOver() {
    try {
      const c = getAudioCtx();
      [660, 550, 440, 330].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.frequency.value = freq;
        const st = c.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.22, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.22);
        osc.start(st);
        osc.stop(st + 0.22);
      });
    } catch {
      // ignore audio errors
    }
  }

  return { playPaddleHit, playWallHit, playScore, playGameOver };
}
