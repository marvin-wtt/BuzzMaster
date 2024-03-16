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
        {{ t('scoreboard.title') }}
      </q-card-section>

      <q-card-section v-if="scores.length > 0">
        <q-list>
          <q-item
            v-for="score in scores"
            :key="score.id"
            clickable
            v-ripple
            @click="updateScore(score)"
          >
            <q-item-section avatar>
              <q-avatar
                :color="avatarColor(score.position)"
                text-color="white"
                size="sm"
              >
                {{ score.position }}
              </q-avatar>
            </q-item-section>

            <q-item-section class="ellipsis">
              {{ score.name }}
            </q-item-section>

            <q-item-section side>
              {{ score.value }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section v-else>
        {{ t('scoreboard.noEntries') }}
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Ok"
          color="primary"
          rounded
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { Score, useScoreboardStore } from 'stores/scoreboard-store';
import { storeToRefs } from 'pinia';
import ScoreUpdateDialog from 'components/scoreboard/ScoreUpdateDialog.vue';
import { useI18n } from 'vue-i18n';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();
const quasar = useQuasar();
const scoreboardStore = useScoreboardStore();
const { scores } = storeToRefs(scoreboardStore);

const updateScore = (score: Score) => {
  quasar
    .dialog({
      component: ScoreUpdateDialog,
      componentProps: {
        score,
      },
    })
    .onOk((payload) => {
      scoreboardStore.updatePoints(score.id, payload);
    });
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

<style scoped></style>
