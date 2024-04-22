import { GameState } from 'app/common/gameState';

export type CastMessage =
  | GameStateCastMessage
  | LocaleCastMessage
  | ControllersCastMessage;

export interface GameStateCastMessage {
  name: 'game-state';
  data: GameState | undefined;
}

export interface LocaleCastMessage {
  name: 'locale';
  data: string;
}

export interface ControllersCastMessage {
  name: 'controllers';
  data: Record<string, string>;
}
