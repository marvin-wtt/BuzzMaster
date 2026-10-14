import { describe, expect, it, vi } from 'vitest';
import {
  CastBroadcaster,
  type CastEvent,
} from '@/../src-electron/castAPI/CastBroadcaster';
import type { GameSettings } from '@/../common/gameSettings';
import type { GameState } from '@/../common/gameState';

const someState = { game: 'simon', name: 'preparing' } as unknown as GameState;
const otherState = { game: 'simon', name: 'showing' } as unknown as GameState;
const someSettings = { simon: { answerTime: 1 } } as unknown as GameSettings;

describe('CastBroadcaster', () => {
  it('fans one update out to every sink', () => {
    const broadcaster = new CastBroadcaster();
    const a: CastEvent[] = [];
    const b: CastEvent[] = [];

    broadcaster.subscribe((e) => a.push(e));
    broadcaster.subscribe((e) => b.push(e));
    broadcaster.updateGameState(someState);

    expect(a).toEqual([{ kind: 'gameState', state: someState }]);
    expect(b).toEqual(a);
  });

  it('stops delivering after unsubscribe', () => {
    const broadcaster = new CastBroadcaster();
    const seen: CastEvent[] = [];

    const unsubscribe = broadcaster.subscribe((e) => seen.push(e));
    broadcaster.updateLocale('de-DE');
    unsubscribe();
    broadcaster.updateLocale('es-ES');

    expect(seen).toHaveLength(1);
  });

  it('keeps other sinks alive when one throws', () => {
    // A crashed cast window must not take the PowerPoint add-in down with it.
    const broadcaster = new CastBroadcaster();
    const seen: CastEvent[] = [];
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    broadcaster.subscribe(() => {
      throw new Error('cast window exploded');
    });
    broadcaster.subscribe((e) => seen.push(e));

    expect(() => broadcaster.updateLocale('de-DE')).not.toThrow();
    expect(seen).toHaveLength(1);
  });

  describe('snapshot', () => {
    it('starts empty but valid', () => {
      const snapshot = new CastBroadcaster().snapshot;

      expect(snapshot.controllers).toEqual({});
      expect(snapshot.locale).toBeTypeOf('string');
      expect(snapshot.gameState).toBeUndefined();
    });

    it('accumulates every kind of update', () => {
      const broadcaster = new CastBroadcaster();

      broadcaster.updateGameState(someState);
      broadcaster.updateGameSettings(someSettings);
      broadcaster.updateControllers({ c1: 'Ada' });
      broadcaster.updateLocale('de-DE');

      expect(broadcaster.snapshot).toEqual({
        gameState: someState,
        gameSettings: someSettings,
        controllers: { c1: 'Ada' },
        locale: 'de-DE',
      });
    });

    it('reflects the latest state, not the first', () => {
      const broadcaster = new CastBroadcaster();

      broadcaster.updateGameState(someState);
      broadcaster.updateGameState(otherState);

      expect(broadcaster.snapshot.gameState).toBe(otherState);
    });

    it('omits gameState entirely once the game is reset', () => {
      const broadcaster = new CastBroadcaster();

      broadcaster.updateGameState(someState);
      broadcaster.updateGameState(undefined);

      // `exactOptionalPropertyTypes`: absent, not present-and-undefined, so the
      // serialised snapshot does not carry a null game.
      expect('gameState' in broadcaster.snapshot).toBe(false);
    });

    it('does not alias its internal state to callers', () => {
      // A late-connecting add-in serialises this at its leisure; handing out the
      // live object would surface as a stale or corrupted cast screen.
      const broadcaster = new CastBroadcaster();
      broadcaster.updateControllers({ c1: 'Ada' });

      const snapshot = broadcaster.snapshot;
      snapshot.controllers.c1 = 'tampered';

      expect(broadcaster.snapshot.controllers.c1).toBe('Ada');
    });

    it('gives a reconnecting client everything it missed', () => {
      // This is why there is no revision counter (plan section 17.1): a client
      // that misses events entirely is still made whole by one snapshot.
      const broadcaster = new CastBroadcaster();
      const late: CastEvent[] = [];

      broadcaster.updateGameSettings(someSettings);
      broadcaster.updateControllers({ c1: 'Ada' });
      broadcaster.updateGameState(someState);

      broadcaster.subscribe((e) => late.push(e));
      const snapshot = broadcaster.snapshot;

      expect(late).toHaveLength(0);
      expect(snapshot.gameState).toBe(someState);
      expect(snapshot.gameSettings).toBe(someSettings);
      expect(snapshot.controllers).toEqual({ c1: 'Ada' });
    });
  });
});
