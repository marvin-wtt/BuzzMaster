export type PongSpeedPreset = 'slow' | 'normal' | 'fast' | 'turbo';

export interface PongSpeedConfig {
  initialSpeed: number;
  speedIncrement: number;
}

export const PONG_SPEED_CONFIGS: Record<PongSpeedPreset, PongSpeedConfig> = {
  slow:   { initialSpeed: 0.7, speedIncrement: 1.03 },
  normal: { initialSpeed: 1.0, speedIncrement: 1.05 },
  fast:   { initialSpeed: 2.0, speedIncrement: 1.07 },
  turbo:  { initialSpeed: 3.5, speedIncrement: 1.10 },
};

export interface PongSettings {
  rounds: number;
  speed: PongSpeedPreset;
}
