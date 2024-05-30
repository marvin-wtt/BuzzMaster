<template>
  <q-page
    class="column"
    padding
  >
    <q-list
      ref="container"
      class="col-grow text-h4 relative-position"
    >
      <transition name="slide-right">
        <!-- This is a workaround because transition group animation always animated single entries instead if the entire page -->
        <div
          v-if="animationToggle"
          class="absolute full-width full-height"
        >
          <cast-leaderboard-entry
            ref="containerItems"
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
          />
        </div>
        <div
          v-else
          class="absolute full-width full-height"
        >
          <cast-leaderboard-entry
            ref="containerItems"
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
          />
        </div>
      </transition>

      <q-resize-observer @resize="updateItemsPerPage" />
    </q-list>
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed, nextTick, onMounted, ref } from 'vue';
import {
  LeaderboardEntry,
  LeaderboardState,
} from 'app/common/gameState/LeaderboardState';
import { QItem, QList } from 'quasar';
import CastLeaderboardEntry from 'components/cast/leaderboard/CastLeaderboardEntry.vue';

const castStore = useCastStore();

const container = ref<QList | null>(null);
const containerItems = ref<QItem[]>([]);
const pageNumber = ref<number>(1);
const pageSize = ref<number>(10);
const animationToggle = ref<boolean>(false);

onMounted(() => {
  nextTick(updateItemsPerPage);
});

const state = computed<LeaderboardState>(() => {
  return castStore.gameState as LeaderboardState;
});

const leaderboard = computed<LeaderboardEntry[]>(() => {
  return state.value.entries;
});

const intervalId = setInterval(() => {
  if (!leaderboard.value) {
    clearInterval(intervalId);
    return;
  }

  animationToggle.value = !animationToggle.value;

  if (pageNumber.value >= leaderboard.value.length / pageSize.value) {
    pageNumber.value = 1;
  } else {
    pageNumber.value += 1;
  }
}, 4000);

const entries = computed<LeaderboardEntry[]>(() => {
  const entries = leaderboard.value;

  if (!entries) {
    return [];
  }

  return paginate(entries, pageNumber.value, pageSize.value);
});

function paginate<T>(array: T[], pageNumber: number, pageSize: number): T[] {
  const startIndex = (pageNumber - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
}

const updateItemsPerPage = () => {
  const el: HTMLElement = container.value?.$el;
  if (!el || containerItems.value.length === 0) {
    return;
  }
  // Use the first list item to measure the item height
  const itemEl: HTMLElement = containerItems.value[0].$el;

  const itemHeight = itemEl.clientHeight;
  const containerHeight = el.clientHeight;
  pageSize.value = Math.max(1, Math.floor(containerHeight / itemHeight));
};
</script>

<style>
body {
  overflow: hidden;
}
</style>

<style scoped>
.slide-right-enter-active {
  transition: all 2s ease-out;
}

.slide-right-leave-active {
  transition: all 2s ease-out;
  position: absolute;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
