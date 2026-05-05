import type { BuzzerButton } from 'src/plugins/buzzer/types';

export type SimonState =
  | SimonPreparingState
  | SimonShowingState
  | SimonInputState
  | SimonRoundOverState
  | SimonGameOverState;

export interface SimonPreparingState {
  game: 'simon';
  name: 'preparing';
  round: 0;
  sequence: [];
  players: string[];
}

export interface SimonShowingState {
  game: 'simon';
  name: 'showing';
  round: number;
  sequence: BuzzerButton[];
  players: string[];
  playerNames: Record<string, string>;

  stepIndex: number;
  showing: boolean;
}

export interface SimonInputState {
  game: 'simon';
  name: 'input';
  round: number;
  sequence: BuzzerButton[];
  players: string[];
  playerNames: Record<string, string>;

  inputIndex: Record<string, number>;
  timeLimit: number;
  startTime: number;
}

export interface SimonRoundOverState {
  game: 'simon';
  name: 'roundOver';
  round: number;
  sequence: BuzzerButton[];
  players: string[];
  playerNames: Record<string, string>;
  survivors: string[];
}

export interface SimonGameOverState {
  game: 'simon';
  name: 'gameOver';
  round: number;
  winner: string | undefined;
}
