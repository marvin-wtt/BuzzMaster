import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import type { Router, RouteRecordRaw } from 'vue-router';
import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import routes from '@/router/routes';
import { PRESET_GAMES } from '@/../common/gamePreset/GamePreset';
import { defaultPresetFor } from '@/../common/gamePreset/defaults';
import { activateGamePreset } from '@/services/gameActivation';
import PowerPointGameSettings from '@/components/powerpoint/PowerPointGameSettings.vue';
import PowerPointCastView from '@/components/powerpoint/PowerPointCastView.vue';
import { useCastStore } from '@/stores/cast-store';
import type { GameState } from '@/../common/gameState';

installQuasarPlugin();

/** Every route name declared anywhere in the app's route tree. */
const routeNames = (() => {
  const names = new Set<string>();
  const walk = (records: readonly RouteRecordRaw[]) => {
    for (const record of records) {
      if (typeof record.name === 'string') {
        names.add(record.name);
      }
      if (record.children) {
        walk(record.children);
      }
    }
  };
  walk(routes);
  return names;
})();

const fakeRouter = () =>
  ({
    hasRoute: (name: string) => routeNames.has(name),
    push: vi.fn().mockResolvedValue(undefined),
  }) as unknown as Router;

/**
 * Phase 7: every game the add-in offers must be complete end to end.
 *
 * A game reaches a slide through five separate pieces — a preset entry, default
 * settings, a settings form, an activation route, and a cast page. Adding a
 * sixth game means touching all five, and missing one fails somewhere far from
 * the change: a dropdown entry that cannot be configured, or an activation that
 * shows a blank slide to an audience.
 *
 * These tests are the guard for that.
 */
describe('preset game coverage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it.each(PRESET_GAMES)('%s has default settings', (game) => {
    const preset = defaultPresetFor(game);

    expect(preset.game).toBe(game);
    expect(Object.keys(preset.settings as object).length).toBeGreaterThan(0);
  });

  it.each(PRESET_GAMES)('%s has a game route', (game) => {
    expect(routeNames.has(`${game}-game`)).toBe(true);
  });

  it.each(PRESET_GAMES)(
    '%s activates against the real route table',
    async (game) => {
      // Uses the app's actual routes, not a stub that says yes to everything.
      const router = fakeRouter();
      const result = await activateGamePreset(defaultPresetFor(game), router);

      expect(result.success).toBe(true);
      expect(router.push).toHaveBeenCalledWith({ name: `${game}-game` });
    },
  );

  it.each(PRESET_GAMES)('%s renders a settings form', (game) => {
    const wrapper = mount(PowerPointGameSettings, {
      props: { modelValue: defaultPresetFor(game) },
    });

    expect(wrapper.findComponent({ name: 'QForm' }).exists()).toBe(true);
  });

  it.each(PRESET_GAMES)('%s renders a cast page', async (game) => {
    const wrapper = mount(PowerPointCastView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
      },
    });

    useCastStore().updateGameState({
      game,
      name: 'preparing',
    } as unknown as GameState);
    await flushPromises();

    expect(wrapper.find('[data-testid="pp-cast-page"]').exists()).toBe(true);
  });
});

/**
 * Plan §39 Phase 7: "only expose games whose configuration and Cast behaviour
 * make sense inside PowerPoint."
 */
describe('deliberate exclusions', () => {
  it('excludes viewing rate, which has no cast page anywhere', () => {
    expect(PRESET_GAMES).not.toContain('viewing-rates');
    // Not an add-in limitation: the desktop app has no viewing-rate cast route
    // either, so there is nothing to put on a slide.
    expect(routeNames.has('cast-viewing-rates')).toBe(false);
  });

  it('excludes leaderboard from presets but still casts it', async () => {
    // A leaderboard has no settings, so it cannot be *configured* on a slide.
    // It is still a game state BuzzMaster can broadcast, so the add-in must
    // render it when it arrives.
    expect(PRESET_GAMES).not.toContain('leaderboard');

    const wrapper = mount(PowerPointCastView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
      },
    });

    useCastStore().updateGameState({
      game: 'leaderboard',
      name: 'idle',
    } as unknown as GameState);
    await flushPromises();

    expect(wrapper.find('[data-testid="pp-cast-page"]').exists()).toBe(true);
  });
});
