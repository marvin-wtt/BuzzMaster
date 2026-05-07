export type PongSpeedPreset = 'slow' | 'normal' | 'fast' | 'turbo';

export interface PongSpeedConfig {
  initialSpeed: number;
  speedIncrement: number;
}

export interface PongSettings {
  rounds: number;
  speed: PongSpeedPreset;
  pointsForWin: number;
}
