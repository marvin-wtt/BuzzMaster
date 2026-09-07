<template>
  <q-page class="column no-wrap q-pa-md">
    <div
      v-if="leaderboard.length === 0"
      class="col-grow column items-center justify-center text-center bm-dim"
    >
      {{ t('leaderboard.noEntries') }}
    </div>

    <template v-else>
      <div class="bm-board col-grow column q-gutter-y-xs">
        <button
          v-for="entry in leaderboard"
          :key="entry.id"
          type="button"
          class="bm-row"
          :class="{ 'bm-row--primary': entry.id === leaderId }"
          @click="showUpdatePoints(entry)"
        >
          <span class="bm-board__rank bm-num">{{ entry.position }}</span>

          <span class="bm-row__body">
            <span class="bm-row__label">{{ entry.name }}</span>
          </span>

          <span class="bm-board__value bm-num">{{ entry.value }}</span>
        </button>
      </div>

      <div class="bm-board__actions">
        <q-btn
          class="full-width"
          :label="t('leaderboard.action.reset')"
          icon="restart_alt"
          outline
          no-caps
          @click="showResetPoints()"
        />
      </div>
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { storeToRefs } from 'pinia';
import { useLeaderboardDialogs } from 'src/composables/leaderboard';
import { useI18n } from 'vue-i18n';
import { computed, watch } from 'vue';
import { useGameState } from 'src/composables/gameState';

const { t } = useI18n();
const leaderboardStore = useLeaderboardStore();
const { leaderboard } = storeToRefs(leaderboardStore);
const { showUpdatePoints, showResetPoints } = useLeaderboardDialogs();

/**
 * The accent marks whoever is actually ahead. While everybody is tied — which
 * is the whole board before the first question — nobody is highlighted.
 */
const leaderId = computed<string | undefined>(() => {
  const [first, second] = leaderboard.value;

  if (!first || !second) {
    return undefined;
  }

  return first.value > second.value ? first.id : undefined;
});

const { transition } = useGameState({
  game: 'leaderboard',
  name: 'default',
  entries: leaderboard.value,
});

watch(
  leaderboard,
  transition('default', (state, value) => {
    return {
      game: 'leaderboard',
      name: 'default',
      entries: value,
    };
  }),
);
</script>

<style lang="scss" scoped>
.bm-board {
  width: 100%;
  max-width: 420px;
  align-self: center;
  overflow-y: auto;
  min-height: 0;
}

.bm-board__rank {
  flex: 0 0 auto;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bm-dim);
  background: var(--bm-surface-alt);
  border: 1px solid var(--bm-line);
}

.bm-row--primary .bm-board__rank {
  color: #fff;
  background: var(--bm-accent);
  border-color: var(--bm-accent);
}

.bm-board__value {
  flex: 0 0 auto;
  font-size: 0.938rem;
  font-weight: 700;
}

.bm-board__actions {
  flex: 0 0 auto;
  width: 100%;
  max-width: 420px;
  align-self: center;
  padding-top: 16px;
}
</style>
