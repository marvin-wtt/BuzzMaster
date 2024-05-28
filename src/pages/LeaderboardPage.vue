<template>
  <q-page
    class="row justify-center"
    padding
  >
    <div
      class="col-xs-12 col-sm-10 col-md-7 col-lg-4 col-xl-2 column justify-between"
    >
      <q-list>
        <q-item
          v-for="entry in leaderboard"
          :key="entry.id"
          clickable
          v-ripple
          @click="showUpdatePoints(entry)"
        >
          <q-item-section avatar>
            <q-avatar
              :color="avatarColor(entry.position)"
              text-color="white"
              size="sm"
            >
              {{ entry.position }}
            </q-avatar>
          </q-item-section>

          <q-item-section class="ellipsis">
            {{ entry.name }}
          </q-item-section>

          <q-item-section side>
            {{ entry.value }}
          </q-item-section>
        </q-item>
      </q-list>

      <div
        class="col-grow column justify-around"
        style="max-height: 300px"
      >
        <div class="row justify-center">
          <q-btn
            :label="t('leaderboard.action.reset')"
            color="primary"
            rounded
            @click="showResetPoints()"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { storeToRefs } from 'pinia';
import { useLeaderboardDialogs } from 'src/composables/leaderboard';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { useGameState } from 'src/composables/gameState';

const { t } = useI18n();
const leaderboardStore = useLeaderboardStore();
const { leaderboard } = storeToRefs(leaderboardStore);
const { showUpdatePoints, showResetPoints } = useLeaderboardDialogs();

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

<style scoped></style>
