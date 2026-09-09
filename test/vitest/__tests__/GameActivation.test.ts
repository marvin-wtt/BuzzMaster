import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { Router } from 'vue-router';
import { activateGamePreset } from '@/services/gameActivation';
import { defaultPresetFor } from '@/../common/gamePreset/defaults';
import { PRESET_GAMES } from '@/../common/gamePreset/GamePreset';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';
import { useGameStore } from '@/stores/game-store';
import { useGameSettingsStore } from '@/stores/game-settings-store';
import type { GameState } from '@/../common/gameState';

const fakeRouter = (overrides: Partial<Router> = {}) =>
  ({
    hasRoute: () => true,
    push: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as Router;

describe('activateGamePreset', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('navigates to the right route for every supported game', async () => {
    for (const game of PRESET_GAMES) {
      const router = fakeRouter();
      const result = await activateGamePreset(defaultPresetFor(game), router);

      expect(result.success, `failed for ${game}`).toBe(true);
      expect(router.push).toHaveBeenCalledWith({ name: `${game}-game` });
    }
  });

  it('copies preset settings into the settings store', async () => {
    const preset = defaultPresetFor('simon');
    if (preset.game !== 'simon') throw new Error('expected simon');
    preset.settings.answerTime = 42;

    await activateGamePreset(preset, fakeRouter());

    expect(useGameSettingsStore().simonSettings.answerTime).toBe(42);
  });

  it('does not alias the preset into reactive state', async () => {
    // The preset lives in a PowerPoint document. Editing settings in BuzzMaster
    // must not silently rewrite the deck.
    const preset = defaultPresetFor('simon');
    if (preset.game !== 'simon') throw new Error('expected simon');

    await activateGamePreset(preset, fakeRouter());

    const store = useGameSettingsStore();
    store.simonSettings.answerTime = 99;

    expect(preset.settings.answerTime).not.toBe(99);
  });

  it('deep-copies array settings too', async () => {
    const preset = defaultPresetFor('quiz');
    if (preset.game !== 'quiz') throw new Error('expected quiz');

    await activateGamePreset(preset, fakeRouter());

    const store = useGameSettingsStore();
    store.quizSettings.activeButtons.pop();

    expect(preset.settings.activeButtons).toHaveLength(4);
  });

  it('resets a running game before switching', async () => {
    // game-store throws on a transition between different games, so a stale
    // state left in place would make activation fail on the next transition.
    const gameStore = useGameStore();
    gameStore.transition({
      game: 'buzzer',
      name: 'idle',
    } as unknown as GameState);
    expect(gameStore.state).toBeDefined();

    const result = await activateGamePreset(
      defaultPresetFor('simon'),
      fakeRouter(),
    );

    expect(result.success).toBe(true);
    expect(gameStore.state).toBeUndefined();
  });

  it('does not start gameplay', async () => {
    // Plan section 14: clicking through slides must never start a timed round.
    await activateGamePreset(defaultPresetFor('simon'), fakeRouter());

    expect(useGameStore().state).toBeUndefined();
  });

  it('fails cleanly when the route is missing', async () => {
    const result = await activateGamePreset(
      defaultPresetFor('simon'),
      fakeRouter({ hasRoute: () => false }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toContain('simon');
  });

  it('reports an unsupported game rather than throwing', async () => {
    const bogus = {
      game: 'viewingRate',
      settings: {},
    } as unknown as GamePreset;

    const result = await activateGamePreset(bogus, fakeRouter());

    expect(result.success).toBe(false);
  });

  it('turns a navigation failure into a result rather than a rejection', async () => {
    const router = fakeRouter({
      push: vi.fn().mockRejectedValue(new Error('navigation aborted')),
    });

    const result = await activateGamePreset(defaultPresetFor('simon'), router);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toContain('navigation aborted');
  });
});
