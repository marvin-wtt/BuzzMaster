<template>
  <q-page
    class="row justify-center"
    padding
  >
    <stopwatch-preparing-cast v-if="state.name === 'preparing'" />
    <stopwatch-running-cast
      v-else
      :state="state"
    />
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import type { StopwatchState } from 'app/common/gameState/StopwatchState';
import StopwatchPreparingCast from 'components/cast/stopwatch/StopwatchPreparingCast.vue';
import StopwatchRunningCast from 'components/cast/stopwatch/StopwatchRunningCast.vue';

const castStore = useCastStore();

const state = computed<StopwatchState>(() => {
  return castStore.gameState as StopwatchState;
});
</script>

<style scoped></style>
