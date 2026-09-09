import { describe, expect, it } from 'vitest';
import {
  POWERPOINT_CONFIG_VERSION,
  createConfig,
  loadConfig,
  withAppearance,
  withPreset,
} from '@/../common/powerpoint/PowerPointConfig';
import { PRESET_GAMES, isPresetGame } from '@/../common/gamePreset/GamePreset';
import { defaultPresetFor } from '@/../common/gamePreset/defaults';

/**
 * A frozen v1 config, exactly as it would sit inside a `.pptx` authored today.
 *
 * Plan section 9a: keep one of these per schema version, forever, and never
 * edit an existing one. When the schema changes, add `FIXTURE_V2` beside it —
 * the point is to prove that decks authored years ago still open.
 */
const FIXTURE_V1 = Object.freeze({
  version: 1,
  instanceId: 'f2977555-0000-4000-8000-000000000000',
  activation: { type: 'manual' },
  preset: {
    game: 'simon',
    settings: {
      answerTime: 1,
      showingSpeed: 1,
      autoNextRound: false,
      lastManStanding: false,
      winnerPoints: 0,
    },
  },
});

describe('PowerPointConfig', () => {
  describe('loadConfig', () => {
    it('loads a frozen v1 config and preserves its preset', () => {
      const result = loadConfig(structuredClone(FIXTURE_V1));

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.config.instanceId).toBe(FIXTURE_V1.instanceId);
      expect(result.config.version).toBe(POWERPOINT_CONFIG_VERSION);
      expect(result.config.preset).toEqual(FIXTURE_V1.preset);
    });

    it('refuses a config written by a newer BuzzMaster rather than coercing it', () => {
      const result = loadConfig({
        ...structuredClone(FIXTURE_V1),
        version: POWERPOINT_CONFIG_VERSION + 1,
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.reason).toBe('too-new');
      expect(result.storedVersion).toBe(POWERPOINT_CONFIG_VERSION + 1);
    });

    it('drops unknown fields instead of failing on them', () => {
      const result = loadConfig({
        ...structuredClone(FIXTURE_V1),
        somethingAddedLater: { nested: true },
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.config).not.toHaveProperty('somethingAddedLater');
      expect(result.config.preset).toEqual(FIXTURE_V1.preset);
    });

    it('omits preset entirely when there is none', () => {
      const result = loadConfig({
        version: 1,
        instanceId: 'abc',
        activation: { type: 'manual' },
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      // exactOptionalPropertyTypes: absent, not present-and-undefined.
      expect('preset' in result.config).toBe(false);
    });

    it.each([
      ['null', null],
      ['a string', 'nope'],
      ['an empty object', {}],
      ['a missing instanceId', { version: 1, activation: { type: 'manual' } }],
      ['a non-integer version', { version: 1.5, instanceId: 'a' }],
      ['a zero version', { version: 0, instanceId: 'a' }],
    ])('rejects %s as malformed', (_label, raw) => {
      const result = loadConfig(raw);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('malformed');
    });
  });

  describe('createConfig', () => {
    it('creates a manual-activation config at the current version', () => {
      const config = createConfig('instance-1');

      expect(config.version).toBe(POWERPOINT_CONFIG_VERSION);
      expect(config.instanceId).toBe('instance-1');
      expect(config.activation).toEqual({ type: 'manual' });
      expect('preset' in config).toBe(false);
    });

    it('round-trips through loadConfig unchanged', () => {
      const config = createConfig('instance-2');
      const result = loadConfig(structuredClone(config));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.config).toEqual(config);
    });
  });
});

describe('GamePreset', () => {
  it('builds a valid preset for every supported game', () => {
    for (const game of PRESET_GAMES) {
      const preset = defaultPresetFor(game);

      expect(preset.game).toBe(game);
      expect(preset.settings).toBeTypeOf('object');
      expect(isPresetGame(preset.game)).toBe(true);
    }
  });

  it('does not share mutable settings between presets', () => {
    // Two PowerPoint elements each hold their own preset; editing one must not
    // reach into the other through a shared default object.
    const a = defaultPresetFor('quiz');
    const b = defaultPresetFor('quiz');

    if (a.game !== 'quiz' || b.game !== 'quiz') {
      throw new Error('expected quiz presets');
    }

    a.settings.answerTime = 99;
    a.settings.activeButtons.pop();

    expect(b.settings.answerTime).not.toBe(99);
    expect(b.settings.activeButtons).toHaveLength(4);
  });

  it('rejects games that have no preset representation', () => {
    // Both are deliberate omissions - see plan section 8.1.
    expect(isPresetGame('viewingRate')).toBe(false);
    expect(isPresetGame('leaderboard')).toBe(false);
    expect(isPresetGame('nonsense')).toBe(false);
  });

  it('survives a JSON round-trip, which is how Office stores it', () => {
    for (const game of PRESET_GAMES) {
      const preset = defaultPresetFor(game);
      expect(JSON.parse(JSON.stringify(preset))).toEqual(preset);
    }
  });
});

/**
 * Regression: changing the game mode used to wipe the element's appearance.
 *
 * The setter rebuilt the config field by field, so anything it did not list was
 * silently dropped. These helpers spread instead, which is what makes a field
 * added to `PowerPointConfig` later survive without anyone remembering to update
 * every call site.
 */
describe('config updates preserve unrelated fields', () => {
  const configured = () => {
    const config = createConfig('instance-1');
    return withAppearance(config, { theme: 'light', background: '#ffeecc' });
  };

  it('keeps appearance when the preset changes', () => {
    const before = configured();

    const after = withPreset(before, defaultPresetFor('simon'));

    expect(after.appearance).toEqual({
      theme: 'light',
      background: '#ffeecc',
    });
    expect(after.preset?.game).toBe('simon');
  });

  it('keeps appearance when switching between games', () => {
    const simon = withPreset(configured(), defaultPresetFor('simon'));

    const pong = withPreset(simon, defaultPresetFor('pong'));

    expect(pong.appearance).toEqual({
      theme: 'light',
      background: '#ffeecc',
    });
    expect(pong.preset?.game).toBe('pong');
  });

  it('keeps appearance when the preset is cleared', () => {
    const simon = withPreset(configured(), defaultPresetFor('simon'));

    const cleared = withPreset(simon, undefined);

    expect(cleared.appearance).toEqual({
      theme: 'light',
      background: '#ffeecc',
    });
    expect('preset' in cleared).toBe(false);
  });

  it('keeps identity and activation across both updates', () => {
    const updated = withAppearance(
      withPreset(configured(), defaultPresetFor('quiz')),
      { theme: 'dark' },
    );

    expect(updated.instanceId).toBe('instance-1');
    expect(updated.activation).toEqual({ type: 'manual' });
    expect(updated.version).toBe(POWERPOINT_CONFIG_VERSION);
  });

  it('keeps the preset when appearance changes', () => {
    const withGame = withPreset(configured(), defaultPresetFor('buzzer'));

    const restyled = withAppearance(withGame, { theme: 'dark' });

    expect(restyled.preset?.game).toBe('buzzer');
  });

  it('does not mutate the config it was given', () => {
    const before = configured();

    withPreset(before, defaultPresetFor('simon'));

    expect('preset' in before).toBe(false);
  });
});
