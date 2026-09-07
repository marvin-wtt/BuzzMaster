<template>
  <div class="cast-entry">
    <span
      class="cast-entry__rank bm-num"
      :class="{ 'cast-entry__rank--lead': props.lead }"
    >
      {{ props.entry.position }}
    </span>

    <span class="cast-entry__name">{{ props.entry.name }}</span>

    <span class="cast-entry__value bm-num">{{ props.entry.value }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { LeaderboardEntry } from 'app/common/gameState/LeaderboardState';

const props = defineProps<{
  entry: LeaderboardEntry;
  /** Set for the single entry that is ahead of the rest. */
  lead?: boolean;
}>();
</script>

<style lang="scss" scoped>
/* Sizes are relative so the page can scale the whole board with one font-size
   and still fit as many rows as the window allows. */
.cast-entry {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.3em 0.5em;
  border-bottom: 1px solid var(--bm-line);
}

.cast-entry__rank {
  flex: 0 0 auto;
  min-width: 1.8em;
  padding: 0 0.25em;
  text-align: center;
  border-radius: 0.18em;
  font-size: 0.62em;
  font-weight: 600;
  color: var(--bm-dim);
  background: var(--bm-surface);
  border: 1px solid var(--bm-line);
}

.cast-entry__rank--lead {
  color: #fff;
  background: var(--bm-accent);
  border-color: var(--bm-accent);
}

.cast-entry__name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cast-entry__value {
  flex: 0 0 auto;
  font-weight: 700;
}
</style>
