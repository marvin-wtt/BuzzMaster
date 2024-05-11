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
import StopwatchScoreDialog from 'components/gameModes/stopwatch/StopwatchScoreDialog.vue';
import { useQuasar } from 'quasar';
import { useScoreboardStore } from 'stores/scoreboard-store';
import { StopwatchEntry } from 'components/gameModes/stopwatch/StopwatchEntry';

const quasar = useQuasar();
const scoreboardStore = useScoreboardStore();

type PointRecord = Record<string, number | undefined>;

let scores: PointRecord = {};

const props = defineProps<{
  label: string | undefined;
  result: StopwatchEntry[];
}>();

const emit = defineEmits<{
  (e: 'update', points: PointRecord): void;
}>();

const updateScores = () => {
  quasar
    .dialog({
      component: StopwatchScoreDialog,
      componentProps: {
        result: props.result,
        scores,
      },
    })
    .onOk((updatedScores: PointRecord) => {
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

      emit('update', updatedScores);

      scores = updatedScores;
    });
};
</script>

<style scoped></style>
