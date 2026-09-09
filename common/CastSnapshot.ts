import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';

/**
 * Everything a cast surface needs to render, in one object.
 *
 * Replaces the untyped `Record<string, unknown[]>` the Electron cast snapshot
 * used to be (plan section 17). Both cast transports now share this shape:
 * IPC to the cast window, and WebSocket to PowerPoint.
 *
 * Deliberately has no `revision` counter. The earlier draft of section 18
 * proposed one, but every connection - including every reconnect - begins with a
 * full snapshot, and a WebSocket delivers the events after it in order. There is
 * no gap for a counter to detect, so it would have been a number nothing checks.
 * See section 17.1.
 */
export interface CastSnapshot {
  gameState?: GameState;
  gameSettings?: GameSettings;
  controllers: Record<string, string>;
  locale: string;
}

export function emptyCastSnapshot(locale = 'en-US'): CastSnapshot {
  return {
    controllers: {},
    locale,
  };
}
