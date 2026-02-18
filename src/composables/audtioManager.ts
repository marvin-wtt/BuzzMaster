import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

interface AudioData {
  buffer: AudioBuffer;
  normalizationGain: number;
}

export function useAudioManager() {
  const quasar = useQuasar();
  const masterVolume = ref<number>(0.7); // Global master volume (0-1)
  const audioContext = ref<AudioContext | null>(null);
  const audioBuffers = ref<Map<number, AudioData>>(new Map());
  const gainNodes = ref<Map<number, GainNode>>(new Map());

  // Default fallback audio path
  const FALLBACK_AUDIO = '/sounds/default-buzz.mp3';

  // Initialize Web Audio API context
  const initAudioContext = (): AudioContext => {
    if (!audioContext.value) {
      audioContext.value = new window.AudioContext();
    }
    return audioContext.value;
  };

  // Analyze audio buffer to calculate peak volume
  const analyzePeakVolume = (audioBuffer: AudioBuffer): number => {
    let peak = 0;
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]!);
        if (abs > peak) {
          peak = abs;
        }
      }
    }
    return peak;
  };

  // Load and normalize audio file
  const loadAudio = async (
    controllerId: number,
    filePath: string | null = null,
  ): Promise<boolean> => {
    try {
      const ctx = initAudioContext();
      const audioPath = filePath || FALLBACK_AUDIO;

      // Fetch audio file
      let arrayBuffer: ArrayBuffer;
      if (filePath && filePath.startsWith('blob:')) {
        // Custom uploaded file
        const response = await fetch(filePath);
        arrayBuffer = await response.arrayBuffer();
      } else {
        // Fallback or file path
        const response = await fetch(audioPath);
        arrayBuffer = await response.arrayBuffer();
      }

      // Decode audio
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Analyze peak volume for normalization
      const peak = analyzePeakVolume(audioBuffer);
      const targetPeak = 0.8; // Target normalization level
      const normalizationGain = peak > 0 ? targetPeak / peak : 1.0;

      // Store buffer and normalization gain
      audioBuffers.value.set(controllerId, {
        buffer: audioBuffer,
        normalizationGain,
      });

      // Create gain node for this controller
      const gainNode = ctx.createGain();
      gainNode.gain.value = masterVolume.value * normalizationGain;
      gainNode.connect(ctx.destination);
      gainNodes.value.set(controllerId, gainNode);

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (ignored) {
      // Try fallback if custom audio failed
      if (filePath && filePath !== FALLBACK_AUDIO) {
        return loadAudio(controllerId, null);
      }

      quasar.notify({
        type: 'negative',
        message: `Failed to load audio for controller ${controllerId}`,
        position: 'top',
      });
      return false;
    }
  };

  // Play audio for a controller
  const playBuzz = async (controllerId: number): Promise<void> => {
    const audioData = audioBuffers.value.get(controllerId);
    const gainNode = gainNodes.value.get(controllerId);

    if (!audioData || !gainNode) {
      return;
    }

    try {
      const ctx = audioContext.value;
      if (!ctx) {
        return;
      }

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Create source node
      const source = ctx.createBufferSource();
      source.buffer = audioData.buffer;

      // Update gain with current master volume and normalization
      gainNode.gain.value = masterVolume.value * audioData.normalizationGain;

      // Connect and play
      source.connect(gainNode);
      source.start(0);
    } catch (error) {
      console.error(
        `Failed to play buzz for controller ${controllerId}:`,
        error,
      );
    }
  };

  // Handle custom audio file upload
  const uploadCustomAudio = async (
    controllerId: number,
    file: File,
  ): Promise<boolean> => {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      quasar.notify({
        type: 'negative',
        message: 'Please upload a valid audio file',
        position: 'top',
      });
      return false;
    }

    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      quasar.notify({
        type: 'negative',
        message: 'Audio file is too large (max 5MB)',
        position: 'top',
      });
      return false;
    }

    try {
      // Create blob URL
      const blobUrl = URL.createObjectURL(file);

      // Load and normalize audio
      const success = await loadAudio(controllerId, blobUrl);

      if (success) {
        quasar.notify({
          type: 'positive',
          message: `Custom audio loaded for controller ${controllerId}`,
          position: 'top',
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to upload custom audio:', error);
      quasar.notify({
        type: 'negative',
        message: 'Failed to upload audio file',
        position: 'top',
      });
      return false;
    }
  };

  // Reset to fallback audio
  const resetToFallback = async (controllerId: number): Promise<boolean> => {
    return loadAudio(controllerId, null);
  };

  // Update all gain nodes when master volume changes
  watch(masterVolume, (newVolume: number) => {
    gainNodes.value.forEach((gainNode: GainNode, controllerId: number) => {
      const audioData = audioBuffers.value.get(controllerId);
      if (audioData) {
        gainNode.gain.value = newVolume * audioData.normalizationGain;
      }
    });
  });

  // Preload all controller audios on initialization
  const preloadControllers = async (controllerIds: number[]): Promise<void> => {
    const promises = controllerIds.map((id) => loadAudio(id));
    await Promise.all(promises);
    console.log('All controller audios preloaded');
  };

  // Cleanup
  const cleanup = async (): Promise<void> => {
    if (audioContext.value) {
      await audioContext.value.close();
      audioContext.value = null;
    }
    audioBuffers.value.clear();
    gainNodes.value.clear();
  };

  return {
    masterVolume,
    loadAudio,
    playBuzz,
    uploadCustomAudio,
    resetToFallback,
    preloadControllers,
    cleanup,
  };
}
