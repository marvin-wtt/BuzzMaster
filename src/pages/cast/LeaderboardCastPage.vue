<template>
  <q-page
    class="column"
    padding
  >
    <!-- TODO Add i18n -->

    <q-list
      ref="container"
      class="col-grow text-h4 relative-position"
    >
      <transition name="slide-right">
        <div
          v-if="animationToggle"
          class="absolute full-width full-height"
        >
          <q-item
            v-for="entry in entries"
            :key="entry.id"
            ref="containerItems"
          >
            <q-item-section avatar>
              <q-avatar
                :color="avatarColor(entry.position)"
                text-color="white"
              >
                {{ entry.position }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ entry.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              {{ entry.value }}
            </q-item-section>
          </q-item>
        </div>
        <div
          v-else
          class="absolute full-width full-height"
        >
          <q-item
            v-for="entry in entries"
            :key="entry.id"
            ref="containerItems"
          >
            <q-item-section avatar>
              <q-avatar
                :color="avatarColor(entry.position)"
                text-color="white"
              >
                {{ entry.position }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ entry.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              {{ entry.value }}
            </q-item-section>
          </q-item>
        </div>
      </transition>

      <q-resize-observer @resize="updateItemsPerPage" />
    </q-list>
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed, ref } from 'vue';
import { Leaderboard } from 'stores/leaderboard-store';
import {
  LeaderboardEntry,
  LeaderboardState,
} from 'app/common/gameState/LeaderboardState';
import { QItem, QList } from 'quasar';

const castStore = useCastStore();

const container = ref<QList | null>(null);
const containerItems = ref<QItem[]>([]);
const pageNumber = ref<number>(1);
const pageSize = ref<number>(10);
const animationToggle = ref<boolean>(false);

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

const entries = computed<Leaderboard>(() => {
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

const avatarColor = (index: number) => {
  switch (index) {
    case 1:
      return 'primary';
    case 2:
      return 'secondary';
    case 3:
      return 'info';
  }

  return 'grey';
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
