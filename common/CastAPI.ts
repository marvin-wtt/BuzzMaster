import { GameState } from 'app/common/gameState';

export interface CastAPI {
  open: () => void;
  close: () => void;
  updateGameState: (state: GameState | undefined) => void;
  onGameStateUpdate: (callback: (state: GameState | undefined) => void) => void;
  updateLocale: (locale: string) => void;
  onLocaleUpdate: (callback: (locale: string) => void) => void;
}
