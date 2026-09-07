import type { GameState } from 'app/common/gameState';
import type { GameSettings } from 'app/common/gameSettings';

export type CastAPI = CastSenderAPI & CastReceiverAPI & CastWindowAPI;

export interface CastSenderAPI {
  ready: () => void;
  toggle: () => void;
  updateGameState: (state: GameState | undefined) => void;
  updateGameSettings: (settings: GameSettings) => void;
  updateLocale: (locale: string) => void;
  updateControllers: (controllers: Record<string, string>) => void;
}

type Callback<F> = (callback: F) => void;
type APICallback<A, K extends keyof A> = Callback<A[K]>;
type CastCallback<K extends keyof CastSenderAPI> = APICallback<
  CastSenderAPI,
  K
>;

export interface CastReceiverAPI {
  onGameStateUpdate: CastCallback<'updateGameState'>;
  onGameSettingsUpdate: CastCallback<'updateGameSettings'>;
  onLocaleUpdate: CastCallback<'updateLocale'>;
  onControllerUpdate: CastCallback<'updateControllers'>;
}

export interface CastWindowAPI {
  /**
   * Asks the main process to re-send the current cast window state. Used by the
   * main window on mount so its status strip is correct after a reload.
   */
  requestWindowState: () => void;

  /**
   * Fires whenever the cast window opens or closes, including when it is closed
   * from its own title bar rather than from the main window.
   */
  onWindowStateUpdate: (callback: (open: boolean) => void) => void;
}
