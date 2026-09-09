import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import PowerPointCastView from '@/components/powerpoint/PowerPointCastView.vue';
import { useCastStore } from '@/stores/cast-store';
import type { GameState } from '@/../common/gameState';
import type { CastSnapshot } from '@/../common/CastSnapshot';

installQuasarPlugin();

const mountCast = () =>
  mount(PowerPointCastView, {
    global: {
      plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
    },
  });

const stateFor = (game: string): GameState =>
  ({ game, name: 'idle' }) as unknown as GameState;

/**
 * Phase 6: the add-in renders the *same* cast pages as the cast window, reading
 * the same store. These tests pin the reuse — if the add-in ever grows its own
 * copy of a cast page, the two surfaces can drift and an audience sees something
 * different depending on which screen they look at.
 */
describe('PowerPointCastView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing until there is a game', () => {
    const wrapper = mountCast();

    expect(wrapper.find('[data-testid="pp-cast-page"]').exists()).toBe(false);
  });

  it.each(['buzzer', 'quiz', 'simon', 'stopwatch', 'pong', 'leaderboard'])(
    'resolves a cast page for %s',
    async (game) => {
      const wrapper = mountCast();
      useCastStore().updateGameState(stateFor(game));
      await flushPromises();

      expect(
        wrapper.find('[data-testid="pp-cast-page"]').exists(),
        `no cast page resolved for ${game}`,
      ).toBe(true);
    },
  );

  it('renders nothing for a game with no cast page', async () => {
    // `viewing-rates` has no cast page. It must render nothing rather than
    // throwing, because this happens live on a slide.
    const wrapper = mountCast();
    useCastStore().updateGameState(stateFor('viewing-rates'));
    await flushPromises();

    expect(wrapper.find('[data-testid="pp-cast-page"]').exists()).toBe(false);
  });

  it('swaps pages when the game changes', async () => {
    const wrapper = mountCast();
    const store = useCastStore();

    store.updateGameState(stateFor('simon'));
    await flushPromises();
    const first = wrapper.find('[data-testid="pp-cast-page"]').exists();

    store.updateGameState(stateFor('pong'));
    await flushPromises();

    expect(first).toBe(true);
    expect(wrapper.find('[data-testid="pp-cast-page"]').exists()).toBe(true);
  });
});

/**
 * The store used to push router routes on every game change. That made it
 * unusable by the add-in, which owns a single route and loses its Office context
 * if navigated away from it.
 */
describe('cast store is navigation-free', () => {
  beforeEach(() => {
    createTestingPinia({ stubActions: false, createSpy: vi.fn });
  });

  it('updates state without needing a router', () => {
    const store = useCastStore();

    expect(() => store.updateGameState(stateFor('simon'))).not.toThrow();
    expect(store.gameState?.game).toBe('simon');
  });

  it('applies a whole snapshot in one call', () => {
    const store = useCastStore();
    const snapshot: CastSnapshot = {
      gameState: stateFor('quiz'),
      controllers: { c1: 'Ada' },
      locale: 'de-DE',
    };

    store.applySnapshot(snapshot);

    expect(store.gameState?.game).toBe('quiz');
    expect(store.controllers).toEqual({ c1: 'Ada' });
  });

  it('clears the game when a reset arrives', () => {
    const store = useCastStore();

    store.updateGameState(stateFor('simon'));
    store.updateGameState(undefined);

    expect(store.gameState).toBeUndefined();
  });
});
