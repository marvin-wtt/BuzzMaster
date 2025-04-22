<template>
  <q-btn
    :label="props.label"
    icon="grade"
    color="grey"
    class="self-center"
    rounded
    @click="updatePoints()"
  />
</template>

<script lang="ts" setup>
import StopwatchPointsDialog from 'components/gameModes/stopwatch/StopwatchPointsDialog.vue';
import { useQuasar } from 'quasar';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import type { StopwatchEntry } from 'components/gameModes/stopwatch/StopwatchEntry';

const quasar = useQuasar();
const leaderboardStore = useLeaderboardStore();

type PointRecord = Record<string, number | undefined>;

let grantedPoints: PointRecord = {};

const props = defineProps<{
  label: string | undefined;
  result: StopwatchEntry[];
}>();

const emit = defineEmits<{
  (e: 'update', points: PointRecord): void;
}>();

const updatePoints = () => {
  quasar
    .dialog({
      component: StopwatchPointsDialog,
      componentProps: {
        result: props.result,
        points: grantedPoints,
      },
    })
    .onOk((updatedPoints: PointRecord) => {
      // Refund previous points
      for (const controllerId in grantedPoints) {
        const points = grantedPoints[controllerId];
        if (points === undefined) {
          continue;
        }

        leaderboardStore.addPoints(controllerId, points * -1);
      }

      // Update points
      for (const controllerId in updatedPoints) {
        const points = updatedPoints[controllerId];
        if (points === undefined) {
          continue;
        }

        leaderboardStore.addPoints(controllerId, points);
      }

      emit('update', updatedPoints);

      grantedPoints = updatedPoints;
    });
};
</script>

<style scoped></style>
