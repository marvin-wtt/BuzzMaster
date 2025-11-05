export type PongState =
  | PongPreparingState
  | PongRunningState
  | PongPaused
  | PongEnded;

export interface PongStateBase {
  game: 'pong';
}

export interface PongPreparingState extends PongStateBase {
  name: 'preparing';
  left: Pick<Team, 'controllerIds'>;
  right: Pick<Team, 'controllerIds'>;
}

export interface PongRunningState extends PongStateBase {
  name: 'running';
  frame: StageFrame | null;
}

export interface PongPaused extends PongStateBase {
  name: 'paused';
  frame: StageFrame | null;
}

export interface PongEnded extends PongStateBase {
  name: 'completed';
  frame: StageFrame | null;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}
export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
}
export interface Team {
  controllerIds: string[]; // which controllers belong to this team
  score: number;
  paddle: Paddle;
}
export interface StageFrame {
  tick: number;
  simTime: number; // ms
  left: { paddle: Paddle; score: number };
  right: { paddle: Paddle; score: number };
  ball: Ball;
}
