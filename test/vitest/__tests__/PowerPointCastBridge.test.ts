import { describe, expect, it } from 'vitest';
import { castEventToMessage } from '@/../src-electron/powerpoint/castBridge';
import { parseServerMessage } from '@/../common/powerpoint/PowerPointProtocol';
import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';

const state = { game: 'simon', name: 'showing' } as unknown as GameState;
const settings = { simon: { answerTime: 1 } } as unknown as GameSettings;

/**
 * The seam where an internal cast event becomes a published protocol message.
 * A mistake here is invisible in the desktop app and shows up only as a cast
 * surface in a slide that silently stops updating.
 */
describe('castEventToMessage', () => {
  it('maps each event kind to its message type', () => {
    expect(castEventToMessage({ kind: 'gameState', state }).type).toBe(
      'cast.gameState',
    );
    expect(castEventToMessage({ kind: 'gameSettings', settings }).type).toBe(
      'cast.gameSettings',
    );
    expect(
      castEventToMessage({ kind: 'controllers', controllers: {} }).type,
    ).toBe('cast.controllers');
    expect(castEventToMessage({ kind: 'locale', locale: 'de-DE' }).type).toBe(
      'cast.locale',
    );
  });

  it('omits state for a reset game rather than sending null', () => {
    const message = castEventToMessage({ kind: 'gameState', state: undefined });

    expect(message).toEqual({ type: 'cast.gameState' });
    expect('state' in message).toBe(false);
  });

  it('produces messages the client can actually parse', () => {
    // Round-trip through JSON and the real parser: the two ends agree, or this
    // fails. Serialising is exactly what the socket does.
    const events = [
      { kind: 'gameState', state },
      { kind: 'gameState', state: undefined },
      { kind: 'gameSettings', settings },
      { kind: 'controllers', controllers: { c1: 'Ada' } },
      { kind: 'locale', locale: 'nl-NL' },
    ] as const;

    for (const event of events) {
      const wire = JSON.stringify(castEventToMessage(event));
      const parsed = parseServerMessage(wire);

      expect(parsed.ok, `failed for ${event.kind}`).toBe(true);
    }
  });
});
