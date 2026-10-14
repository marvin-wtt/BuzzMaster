/**
 * Wire protocol between the PowerPoint add-in and the BuzzMaster desktop app.
 *
 * Versioned from the first message, because the add-in and the desktop app are
 * upgraded independently: a deck opened on a machine with an older BuzzMaster
 * has to fail with something better than silence.
 *
 * Every parser here validates at runtime. TypeScript says nothing about bytes
 * arriving on a socket - see plan section 26.6, which is non-negotiable
 * regardless of how the authentication question resolved.
 */

import type { CastSnapshot } from '@/../common/CastSnapshot';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';
import { isPresetGame } from '@/../common/gamePreset/GamePreset';
import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';

export const POWERPOINT_PROTOCOL_VERSION = 1;

/** Fixed port. See plan section 22.1 for why it cannot be negotiated. */
export const POWERPOINT_PORT = 43127;

export const POWERPOINT_WS_PATH = '/ws';

/**
 * Reports whether the command channel is accepting connections.
 *
 * A failed WebSocket handshake cannot distinguish "BuzzMaster is not running"
 * from "the integration is switched off", and those need opposite advice.
 */
export const POWERPOINT_STATUS_PATH = '/powerpoint/status';

/**
 * Port the WebSocket server binds during development.
 *
 * In production Electron serves both the add-in and the socket on
 * POWERPOINT_PORT. In development the Vite dev server owns that port (it serves
 * the renderer with HMR), so Electron listens here instead and Vite proxies
 * `/ws` through to it.
 *
 * The add-in therefore always connects to a same-origin `/ws`, in both dev and
 * production. That uniformity is the point: a dev-only URL branch is exactly the
 * kind of thing that works all the way to release and then fails in the packaged
 * build.
 */
export const POWERPOINT_DEV_WS_PORT = 43128;

/**
 * Origins permitted to open a control socket.
 *
 * This is the entire security model, and Phase 0 (Q4) is what justifies it: the
 * add-in's WebView2 sends a specific, unforgeable origin rather than `null`, so
 * a browser page cannot impersonate it. A token would add nothing, because the
 * add-in loads its own HTML from this same server - see plan section 26.1.
 *
 * Both spellings are accepted because the dev server advertises 127.0.0.1 while
 * the manifest uses localhost. They are the same loopback origin.
 */
export function allowedOrigins(port: number = POWERPOINT_PORT): string[] {
  return [`https://localhost:${port}`, `https://127.0.0.1:${port}`];
}

export function isAllowedOrigin(
  origin: string | undefined,
  port: number = POWERPOINT_PORT,
): boolean {
  // An absent or `null` origin is refused rather than treated as trusted: any
  // sandboxed iframe on the web can send `null`.
  if (!origin) {
    return false;
  }
  return allowedOrigins(port).includes(origin);
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface ClientHello {
  type: 'hello';
  protocolVersion: number;
  instanceId: string;
}

/**
 * Ask BuzzMaster to load a preset.
 *
 * The ONLY command in the protocol, and §26.1's decision to ship without an
 * authentication token depends on it staying that way (§19.1). It was weighed
 * before being added:
 *
 *  - it configures a game and leaves it in its preparing phase;
 *  - it deliberately does not start timed gameplay (§14), so a rogue activation
 *    cannot make anyone lose a round;
 *  - the operator sees the change immediately in the BuzzMaster window;
 *  - the worst outcome remains an interrupted quiz night.
 *
 * A future command that starts play, awards points, or mutates the leaderboard
 * would NOT satisfy that reasoning and must re-open §26 before being added.
 */
export interface ClientActivate {
  type: 'game.activate';
  requestId: string;
  instanceId: string;
  preset: GamePreset;
}

export type PowerPointClientMessage = ClientHello | ClientActivate;

export interface ServerHello {
  type: 'hello';
  protocolVersion: number;
  appVersion: string;
}

export type ServerErrorCode =
  'incompatible-protocol' | 'invalid-message' | 'forbidden-origin';

export interface ServerError {
  type: 'error';
  code: ServerErrorCode;
  message: string;
}

/**
 * Complete cast state, sent immediately after a successful handshake and after
 * every reconnect (plan section 18). A client never has to reconstruct state
 * from events it may have missed.
 */
export interface CastSnapshotMessage {
  type: 'cast.snapshot';
  snapshot: CastSnapshot;
}

/** Incremental updates, sent only to already-handshaken clients. */
export interface CastGameStateMessage {
  type: 'cast.gameState';
  state?: GameState;
}

export interface CastGameSettingsMessage {
  type: 'cast.gameSettings';
  settings: GameSettings;
}

export interface CastControllersMessage {
  type: 'cast.controllers';
  controllers: Record<string, string>;
}

export interface CastLocaleMessage {
  type: 'cast.locale';
  locale: string;
}

export interface ActivationResultMessage {
  type: 'game.activationResult';
  requestId: string;
  success: boolean;
  error?: string;
}

export type PowerPointServerMessage =
  | ServerHello
  | ActivationResultMessage
  | ServerError
  | CastSnapshotMessage
  | CastGameStateMessage
  | CastGameSettingsMessage
  | CastControllersMessage
  | CastLocaleMessage;

// ---------------------------------------------------------------------------
// Runtime validation
// ---------------------------------------------------------------------------

export type ParseResult<T> =
  { ok: true; message: T } | { ok: false; reason: string };

function asRecord(raw: unknown): Record<string, unknown> | undefined {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return undefined;
  }
  return raw as Record<string, unknown>;
}

/** Parse a JSON string received from a client. Never throws. */
export function parseClientMessage(
  raw: string,
): ParseResult<PowerPointClientMessage> {
  let decoded: unknown;

  try {
    decoded = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'not valid JSON' };
  }

  const record = asRecord(decoded);
  if (!record) {
    return { ok: false, reason: 'not an object' };
  }

  if (typeof record.instanceId !== 'string' || record.instanceId === '') {
    return { ok: false, reason: 'instanceId must be a non-empty string' };
  }

  if (record.type === 'hello') {
    if (
      typeof record.protocolVersion !== 'number' ||
      !Number.isInteger(record.protocolVersion)
    ) {
      return { ok: false, reason: 'protocolVersion must be an integer' };
    }

    return {
      ok: true,
      message: {
        type: 'hello',
        protocolVersion: record.protocolVersion,
        instanceId: record.instanceId,
      },
    };
  }

  if (record.type === 'game.activate') {
    if (typeof record.requestId !== 'string' || record.requestId === '') {
      return { ok: false, reason: 'requestId must be a non-empty string' };
    }

    const preset = validatePreset(record.preset);
    if (!preset.ok) {
      return preset;
    }

    return {
      ok: true,
      message: {
        type: 'game.activate',
        requestId: record.requestId,
        instanceId: record.instanceId,
        preset: preset.message,
      },
    };
  }

  return {
    ok: false,
    reason: `unknown message type: ${String(record.type)}`,
  };
}

/**
 * Validate a preset arriving from a client.
 *
 * This is the untrusted direction, so the game discriminator is checked against
 * the known set rather than trusted. The per-game settings fields are not deeply
 * validated here: they are applied through the game settings store, which owns
 * their shape, and a malformed value there produces a bad game configuration
 * rather than a security problem. The discriminator is the part that decides
 * which code path runs, so it is the part that is checked.
 */
function validatePreset(raw: unknown): ParseResult<GamePreset> {
  const record = asRecord(raw);

  if (!record) {
    return { ok: false, reason: 'preset must be an object' };
  }

  if (!isPresetGame(record.game)) {
    return { ok: false, reason: `unsupported game: ${String(record.game)}` };
  }

  if (!asRecord(record.settings)) {
    return { ok: false, reason: 'preset.settings must be an object' };
  }

  return { ok: true, message: record as unknown as GamePreset };
}

/** Parse a JSON string received from the server. Never throws. */
export function parseServerMessage(
  raw: string,
): ParseResult<PowerPointServerMessage> {
  let decoded: unknown;

  try {
    decoded = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'not valid JSON' };
  }

  const record = asRecord(decoded);
  if (!record) {
    return { ok: false, reason: 'not an object' };
  }

  if (record.type === 'hello') {
    if (
      typeof record.protocolVersion !== 'number' ||
      !Number.isInteger(record.protocolVersion)
    ) {
      return { ok: false, reason: 'protocolVersion must be an integer' };
    }
    if (typeof record.appVersion !== 'string') {
      return { ok: false, reason: 'appVersion must be a string' };
    }
    return {
      ok: true,
      message: {
        type: 'hello',
        protocolVersion: record.protocolVersion,
        appVersion: record.appVersion,
      },
    };
  }

  if (record.type === 'game.activationResult') {
    if (typeof record.requestId !== 'string') {
      return { ok: false, reason: 'activationResult requires a requestId' };
    }
    if (typeof record.success !== 'boolean') {
      return { ok: false, reason: 'activationResult requires success' };
    }
    return {
      ok: true,
      message:
        typeof record.error === 'string'
          ? {
              type: 'game.activationResult',
              requestId: record.requestId,
              success: record.success,
              error: record.error,
            }
          : {
              type: 'game.activationResult',
              requestId: record.requestId,
              success: record.success,
            },
    };
  }

  if (record.type === 'error') {
    if (typeof record.code !== 'string' || typeof record.message !== 'string') {
      return { ok: false, reason: 'error requires code and message strings' };
    }
    return {
      ok: true,
      message: {
        type: 'error',
        code: record.code as ServerErrorCode,
        message: record.message,
      },
    };
  }

  // ---- cast messages ----
  //
  // These are validated at the envelope only: the discriminator plus the shape
  // of the top-level field. The payloads are BuzzMaster's own `GameState` and
  // `GameSettings`, arriving from BuzzMaster itself over a loopback socket with
  // a certificate this machine trusts.
  //
  // Deep-validating them here would mean reimplementing the whole discriminated
  // union of every game's state in validator form, and keeping that copy in step
  // forever. The security-critical direction is the other one - commands
  // arriving AT the desktop app - and `parseClientMessage` does validate those
  // fully. See plan section 26.6.
  if (record.type === 'cast.snapshot') {
    const snapshot = asRecord(record.snapshot);
    if (!snapshot) {
      return { ok: false, reason: 'cast.snapshot requires a snapshot object' };
    }
    if (typeof snapshot.locale !== 'string') {
      return { ok: false, reason: 'snapshot.locale must be a string' };
    }
    if (!asRecord(snapshot.controllers)) {
      return { ok: false, reason: 'snapshot.controllers must be an object' };
    }
    return {
      ok: true,
      message: {
        type: 'cast.snapshot',
        snapshot: snapshot as unknown as CastSnapshot,
      },
    };
  }

  if (record.type === 'cast.gameState') {
    if (record.state !== undefined && !asRecord(record.state)) {
      return { ok: false, reason: 'cast.gameState state must be an object' };
    }
    return record.state === undefined
      ? { ok: true, message: { type: 'cast.gameState' } }
      : {
          ok: true,
          message: {
            type: 'cast.gameState',
            state: record.state as unknown as GameState,
          },
        };
  }

  if (record.type === 'cast.gameSettings') {
    if (!asRecord(record.settings)) {
      return { ok: false, reason: 'cast.gameSettings requires settings' };
    }
    return {
      ok: true,
      message: {
        type: 'cast.gameSettings',
        settings: record.settings as unknown as GameSettings,
      },
    };
  }

  if (record.type === 'cast.controllers') {
    const controllers = asRecord(record.controllers);
    if (!controllers) {
      return { ok: false, reason: 'cast.controllers requires an object' };
    }
    return {
      ok: true,
      message: {
        type: 'cast.controllers',
        controllers: controllers as Record<string, string>,
      },
    };
  }

  if (record.type === 'cast.locale') {
    if (typeof record.locale !== 'string') {
      return { ok: false, reason: 'cast.locale requires a string locale' };
    }
    return {
      ok: true,
      message: { type: 'cast.locale', locale: record.locale },
    };
  }

  return { ok: false, reason: `unknown message type: ${String(record.type)}` };
}

/**
 * Whether a peer's protocol version can be spoken.
 *
 * Exact match today. When the protocol gains backwards-compatible additions this
 * becomes a range check - keep the decision here rather than inline at both ends,
 * so the two sides cannot drift apart on what "compatible" means.
 */
export function isCompatibleProtocol(version: number): boolean {
  return version === POWERPOINT_PROTOCOL_VERSION;
}
