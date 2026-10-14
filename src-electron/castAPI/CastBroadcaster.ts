import type { CastSnapshot } from '@/../common/CastSnapshot';
import { emptyCastSnapshot } from '@/../common/CastSnapshot';
import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';

export type CastEvent =
  | { kind: 'gameState'; state: GameState | undefined }
  | { kind: 'gameSettings'; settings: GameSettings }
  | { kind: 'controllers'; controllers: Record<string, string> }
  | { kind: 'locale'; locale: string };

export type CastSink = (event: CastEvent) => void;

/**
 * Single source of cast state in the main process (plan section 17).
 *
 * The main window pushes updates in; any number of sinks fan them out. Today
 * that is the cast BrowserWindow over IPC and the PowerPoint add-in over a
 * WebSocket, but the broadcaster knows about neither — which is the point.
 * Electron IPC stays the right transport between two Electron windows
 * (section 31); the socket exists only because PowerPoint cannot reach IPC.
 *
 * It also holds the current snapshot, so any surface that connects late — a cast
 * window opened mid-game, an add-in that just reconnected — can be brought fully
 * up to date in one message rather than reconstructing state from events it
 * never saw (section 18).
 */
export class CastBroadcaster {
  #snapshot: CastSnapshot = emptyCastSnapshot();
  #sinks = new Set<CastSink>();

  get snapshot(): CastSnapshot {
    // Copied on read: sinks serialise this at their leisure, and handing out the
    // live object invites a subtle aliasing bug that would only show up as a
    // stale cast screen.
    return {
      ...this.#snapshot,
      controllers: { ...this.#snapshot.controllers },
    };
  }

  /** Register a fan-out target. Returns an unsubscribe function. */
  subscribe(sink: CastSink): () => void {
    this.#sinks.add(sink);
    return () => this.#sinks.delete(sink);
  }

  updateGameState(state: GameState | undefined): void {
    if (state === undefined) {
      delete this.#snapshot.gameState;
    } else {
      this.#snapshot.gameState = state;
    }
    this.#emit({ kind: 'gameState', state });
  }

  updateGameSettings(settings: GameSettings): void {
    this.#snapshot.gameSettings = settings;
    this.#emit({ kind: 'gameSettings', settings });
  }

  updateControllers(controllers: Record<string, string>): void {
    this.#snapshot.controllers = controllers;
    this.#emit({ kind: 'controllers', controllers });
  }

  updateLocale(locale: string): void {
    this.#snapshot.locale = locale;
    this.#emit({ kind: 'locale', locale });
  }

  #emit(event: CastEvent): void {
    for (const sink of this.#sinks) {
      // One failing sink must not stop the others. A crashed cast window should
      // never take the PowerPoint add-in down with it, or vice versa.
      try {
        sink(event);
      } catch (error) {
        console.error('Cast sink failed', error);
      }
    }
  }
}
