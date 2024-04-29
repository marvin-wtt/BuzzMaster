import { GameState } from 'app/common/gameState';

export type CastAPI = CastSenderAPI & CastReceiverAPI;

export interface CastSenderAPI {
  open: () => void;
  close: () => void;
  updateGameState: (state: GameState | undefined) => void;
  updateLocale: (locale: string) => void;
  updateController: (controllers: Record<string, string>) => void;
}

type Callback<F> = (callback: F) => void;
type APICallback<A, K extends keyof A> = Callback<A[K]>;
type CastCallback<K extends keyof CastSenderAPI> = APICallback<
  CastSenderAPI,
  K
>;

export interface CastReceiverAPI {
  onGameStateUpdate: CastCallback<'updateGameState'>;
  onLocaleUpdate: CastCallback<'updateLocale'>;
  onControllerUpdate: CastCallback<'updateController'>;
}
