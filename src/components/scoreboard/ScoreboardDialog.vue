<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="max-width: 350px"
    >
      <q-card-section>
        <a class="text-h5">Leaderboard</a>
      </q-card-section>

      <q-card-section>
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

            <q-item-section>
              {{ score.name }}
            </q-item-section>

            <q-item-section side>
              {{ score.value }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Ok"
          color="primary"
          @click="onDialogOK"
          rounded
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

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

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