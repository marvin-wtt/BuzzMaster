<template>
  <!-- The cast pages are `<q-page>`s, so they need a layout ancestor. `container`
       mode keeps that scoped to this element instead of the viewport, which is
       what lets a full cast page render inside a slide. -->
  <q-layout
    view="lHh Lpr lFf"
    container
    class="pp-cast"
  >
    <q-page-container v-if="castPage">
      <div
        class="pp-cast-slot"
        data-testid="pp-cast-page"
      >
        <component :is="castPage" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useCastStore } from '@/stores/cast-store';
import type { GameState } from '@/../common/gameState';

/**
 * Renders the real cast pages inside the PowerPoint add-in (plan section 21).
 *
 * These are the same components the cast window uses, reading the same
 * `cast-store` — not a reimplementation. The store is fed here from the
 * WebSocket instead of Electron IPC, which is the entire difference between the
 * two surfaces.
 *
 * Selected by game rather than by route: the add-in owns a single route and must
 * stay on it, or it loses its Office context.
 */
const castPages: Partial<
  Record<GameState['game'], ReturnType<typeof defineAsyncComponent>>
> = {
  buzzer: defineAsyncComponent(() => import('@/pages/cast/BuzzerCastPage.vue')),
  quiz: defineAsyncComponent(() => import('@/pages/cast/QuizCastPage.vue')),
  simon: defineAsyncComponent(() => import('@/pages/cast/SimonCastPage.vue')),
  stopwatch: defineAsyncComponent(
    () => import('@/pages/cast/StopwatchCastPage.vue'),
  ),
  pong: defineAsyncComponent(() => import('@/pages/cast/PongCastPage.vue')),
  leaderboard: defineAsyncComponent(
    () => import('@/pages/cast/LeaderboardCastPage.vue'),
  ),
  // `viewing-rates` is deliberately absent: it has no cast page, and it is not
  // in the preset union either (plan section 8.1). A Partial record says that
  // outright rather than faking an entry, and an unmapped game simply renders
  // nothing instead of throwing on a slide.
};

const castStore = useCastStore();

const castPage = computed(() => {
  const game = castStore.gameState?.game;
  return game ? castPages[game] : undefined;
});
</script>

<style scoped>
.pp-cast-slot {
  height: 100%;
}

.pp-cast {
  /* Fill the add-in frame. The cast pages are already responsive - they are
     normally shown in a portrait window - so they adapt to whatever size
     PowerPoint gives the element. */
  height: 100%;
  min-height: 100%;
}
</style>
