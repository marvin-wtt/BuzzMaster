<template>
  <q-btn
    :label="props.label"
    icon="grade"
    color="grey"
    class="self-center"
    rounded
    @click="updateScores()"
  />
</template>

<script lang="ts" setup>
import StopwatchScoreDialog from 'components/questions/stopwatch/StopwatchScoreDialog.vue';
import { useQuasar } from 'quasar';
import { useScoreboardStore } from 'stores/scoreboard-store';
import { IController } from 'src/plugins/buzzer/types';

const quasar = useQuasar();
const scoreboardStore = useScoreboardStore();

let scores: Record<string, number | undefined> = {};

const props = defineProps<{
  label: string | undefined;
  controllers: IController[];
}>();

const updateScores = () => {
  const controllers = props.controllers;

  quasar
    .dialog({
      component: StopwatchScoreDialog,
      componentProps: {
        controllers,
        scores,
      },
    })
    .onOk((updatedScores: Record<string, number | undefined>) => {
      // Refund previous points
      for (const controllerId in scores) {
        const points = scores[controllerId];
        if (points === undefined) {
          continue;
        }

        scoreboardStore.addPoints(controllerId, points * -1);
      }

      // Update points
      for (const controllerId in updatedScores) {
        const points = updatedScores[controllerId];
        if (points === undefined) {
          continue;
        }

        scoreboardStore.addPoints(controllerId, points);
      }

      scores = updatedScores;
    });
};
</script>

<style scoped></style>
