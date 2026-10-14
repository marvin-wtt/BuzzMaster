import { ref, onScopeDispose, type Ref } from 'vue';
import {
  POWERPOINT_PROTOCOL_VERSION,
  POWERPOINT_STATUS_PATH,
  POWERPOINT_WS_PATH,
  isCompatibleProtocol,
  parseServerMessage,
  type PowerPointServerMessage,
} from '@/../common/powerpoint/PowerPointProtocol';
import type { CastSnapshot } from '@/../common/CastSnapshot';
import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';

/** Plan section 27. Every one of these must render something meaningful. */
export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  /** BuzzMaster is running, but the integration is switched off in its settings. */
  | 'disabled'
  | 'incompatible'
  | 'error';

/**
 * Reconnect backoff, in milliseconds (plan section 28).
 *
 * Starts fast because the common case is BuzzMaster restarting while a deck
 * stays open, and caps at 10s so a presentation left running overnight is not
 * hammering a socket.
 */
const BACKOFF_MS = [250, 500, 1000, 2000, 5000, 10_000] as const;

/**
 * Where cast updates are delivered.
 *
 * The connection deliberately knows nothing about Pinia or components: it moves
 * bytes and hands over typed values. That keeps this testable without a DOM and
 * lets Phase 6 point the same stream at the real cast store.
 */
export interface CastSink {
  applySnapshot: (snapshot: CastSnapshot) => void;
  updateGameState: (state: GameState | undefined) => void;
  updateGameSettings: (settings: GameSettings) => void;
  updateControllers: (controllers: Record<string, string>) => void;
  updateLocale: (locale: string) => void;
}

export type ActivationStatus = 'idle' | 'activating' | 'activated' | 'failed';

export interface UsePowerPointConnectionResult {
  state: Ref<ConnectionState>;
  appVersion: Ref<string | undefined>;
  error: Ref<string | undefined>;
  activation: Ref<ActivationStatus>;
  activationError: Ref<string | undefined>;
  /** Ask BuzzMaster to load a preset. Resolves when it replies or times out. */
  activate: (preset: GamePreset) => void;
}

/**
 * Maintain the add-in's connection to the BuzzMaster desktop app.
 *
 * Phase 0 (Q5) showed the add-in is *not* torn down when entering Slide Show,
 * so reconnection is a genuine error path rather than something that happens on
 * every slide change. It still has to be robust: BuzzMaster may be started after
 * the deck is open, restarted mid-presentation, or never running at all.
 */
export function usePowerPointConnection(
  instanceId: Ref<string | undefined>,
  sink?: Partial<CastSink>,
): UsePowerPointConnectionResult {
  const state = ref<ConnectionState>('connecting');
  const appVersion = ref<string>();
  const error = ref<string>();
  const activation = ref<ActivationStatus>('idle');
  const activationError = ref<string>();

  let pendingRequestId: string | undefined;

  let socket: WebSocket | undefined;
  let attempt = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  function scheduleReconnect() {
    if (disposed || retryTimer !== undefined) {
      return;
    }

    const delay =
      BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)] ?? 10_000;
    attempt += 1;

    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      connect();
    }, delay);
  }

  function handle(message: PowerPointServerMessage): void {
    switch (message.type) {
      case 'error':
        state.value =
          message.code === 'incompatible-protocol' ? 'incompatible' : 'error';
        error.value = message.message;
        return;

      case 'hello':
        if (!isCompatibleProtocol(message.protocolVersion)) {
          state.value = 'incompatible';
          error.value = `BuzzMaster speaks protocol v${message.protocolVersion}; this add-in speaks v${POWERPOINT_PROTOCOL_VERSION}.`;
          return;
        }
        // Only a completed handshake counts as connected. An open socket alone
        // does not mean the far end is a BuzzMaster that can talk to us.
        attempt = 0;
        appVersion.value = message.appVersion;
        error.value = undefined;
        state.value = 'connected';
        return;

      case 'game.activationResult':
        // Ignore a reply to a request this element did not make: several add-ins
        // may be connected, and only the one that asked should react
        // (plan section 20).
        if (message.requestId !== pendingRequestId) {
          return;
        }
        pendingRequestId = undefined;
        if (message.success) {
          activation.value = 'activated';
          activationError.value = undefined;
        } else {
          activation.value = 'failed';
          activationError.value = message.error;
        }
        return;

      case 'cast.snapshot':
        sink?.applySnapshot?.(message.snapshot);
        return;

      case 'cast.gameState':
        sink?.updateGameState?.(message.state);
        return;

      case 'cast.gameSettings':
        sink?.updateGameSettings?.(message.settings);
        return;

      case 'cast.controllers':
        sink?.updateControllers?.(message.controllers);
        return;

      case 'cast.locale':
        sink?.updateLocale?.(message.locale);
        return;
    }
  }

  function connect() {
    if (disposed) {
      return;
    }

    // Same origin as the page: the add-in is served by the very server it talks
    // to, which is also what makes the Origin allowlist meaningful.
    const url = `wss://${window.location.host}${POWERPOINT_WS_PATH}`;

    try {
      socket = new WebSocket(url);
    } catch (reason) {
      state.value = 'error';
      error.value = String(reason);
      scheduleReconnect();
      return;
    }

    socket.onopen = () => {
      socket?.send(
        JSON.stringify({
          type: 'hello',
          protocolVersion: POWERPOINT_PROTOCOL_VERSION,
          instanceId: instanceId.value ?? 'unknown',
        }),
      );
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      const result = parseServerMessage(String(event.data));

      if (!result.ok) {
        // A malformed frame is not worth tearing the connection down for, but it
        // must never be silently ignored either.
        console.warn('Discarded malformed BuzzMaster message:', result.reason);
        return;
      }

      handle(result.message);
    };

    socket.onclose = () => {
      socket = undefined;
      if (pendingRequestId !== undefined) {
        // The reply can never arrive now. Leaving it spinning would show a
        // permanent "activating" state on the slide.
        pendingRequestId = undefined;
        activation.value = 'failed';
        activationError.value = 'Lost connection to BuzzMaster.';
      }
      if (state.value !== 'incompatible' && state.value !== 'disabled') {
        // Both of those stay true across a reconnect attempt, so re-asserting
        // "disconnected" every backoff tick would just make the slide flicker
        // between two messages. A successful connection clears them.
        state.value = 'disconnected';
      }

      // A refused handshake looks identical whether BuzzMaster is absent or the
      // integration is switched off, and those need opposite advice. Ask.
      void classifyFailure();

      scheduleReconnect();
    };

    socket.onerror = () => {
      // `onclose` always follows, which is where the retry is scheduled.
      if (state.value === 'connecting') {
        state.value = 'disconnected';
      }
    };
  }

  /**
   * Work out *why* the socket is unavailable.
   *
   * If the status endpoint answers, BuzzMaster is running and serving the add-in
   * — so a refused socket means the integration is disabled, which the user can
   * fix themselves. If it does not answer, BuzzMaster simply is not there.
   */
  async function classifyFailure(): Promise<void> {
    // Read through a function so the value is genuinely re-read after the await.
    // A plain `state.value` check would be narrowed by the guard below and the
    // compiler would treat the later comparison as dead — but the connection can
    // succeed while this request is in flight, and overwriting `connected` with
    // `disabled` would be wrong.
    const current = (): ConnectionState => state.value;

    if (disposed || current() === 'connected') {
      return;
    }

    try {
      const response = await fetch(POWERPOINT_STATUS_PATH, {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const status: unknown = await response.json();

      if (
        typeof status === 'object' &&
        status !== null &&
        'websocket' in status &&
        status.websocket === false &&
        current() !== 'connected'
      ) {
        state.value = 'disabled';
      }
    } catch {
      // BuzzMaster is not reachable at all: `disconnected` is already correct.
    }
  }

  function activate(preset: GamePreset): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      activation.value = 'failed';
      activationError.value = 'Not connected to BuzzMaster.';
      return;
    }

    const requestId = crypto.randomUUID();
    pendingRequestId = requestId;
    activation.value = 'activating';
    activationError.value = undefined;

    socket.send(
      JSON.stringify({
        type: 'game.activate',
        requestId,
        instanceId: instanceId.value ?? 'unknown',
        preset,
      }),
    );
  }

  connect();

  onScopeDispose(() => {
    disposed = true;
    if (retryTimer !== undefined) {
      clearTimeout(retryTimer);
    }
    socket?.close();
    socket = undefined;
  });

  return { state, appVersion, error, activation, activationError, activate };
}
