<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="min-width: 350px; width: 400px"
    >
      <q-card-section class="text-center text-h5">
        {{ t('leaderboard.title') }}
      </q-card-section>

      <q-card-section v-if="leaderboard.length > 0">
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
      </q-card-section>

      <q-card-section v-else>
        {{ t('leaderboard.noEntries') }}
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('leaderboard.action.reset')"
          color="primary"
          rounded
          outline
          @click="showResetPoints()"
        />
        <q-btn
          :label="t('leaderboard.action.ok')"
          color="primary"
          rounded
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useLeaderboardDialogs } from 'src/composables/leaderboard';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();
const leaderboardStore = useLeaderboardStore();
const { leaderboard } = storeToRefs(leaderboardStore);
const { showUpdatePoints, showResetPoints } = useLeaderboardDialogs();

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
