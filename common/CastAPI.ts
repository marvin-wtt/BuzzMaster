import type { GameState } from 'app/common/gameState';
import type { GameSettings } from 'app/common/gameSettings';

export type CastAPI = CastSenderAPI & CastReceiverAPI;

export interface CastSenderAPI {
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
