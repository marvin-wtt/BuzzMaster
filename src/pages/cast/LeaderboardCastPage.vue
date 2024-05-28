<template>
  <q-page
    class="column"
    padding
  >
    <!-- TODO Add i18n -->
    <div class="text-center text-h2 q-ma-lg">Leaderboard</div>

    <div class="col-grow relative-position text-h4">
      <q-scroll-area class="absolute fit">
        <q-list>
          <transition-group name="list">
            <q-item
              v-for="entry in entries"
              :key="entry.id"
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
          </transition-group>
        </q-list>
      </q-scroll-area>
    </div>
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

const castStore = useCastStore();

const pageNumber = ref<number>(1);
const pageSize = 10;

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

  if (pageNumber.value >= leaderboard.value.length / pageSize) {
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

  return paginate(entries, pageNumber.value, pageSize);
});

function paginate<T>(array: T[], pageNumber: number, pageSize: number): T[] {
  const startIndex = (pageNumber - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
}

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

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
