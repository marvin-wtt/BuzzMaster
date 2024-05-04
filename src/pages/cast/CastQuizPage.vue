<template>
  <q-page
    class="row justify-center"
    padding
  >
    <quiz-preparing-cast v-if="state.name === 'preparing'" />
    <quiz-running-cast
      v-else-if="state.name === 'running'"
      :state="state"
    />
    <template v-else-if="state.name === 'completed'" />
  </q-page>
</template>

<script lang="ts" setup>
import QuizPreparingCast from 'components/cast/quiz/QuizPreparingCast.vue';

import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import { QuizState } from 'app/common/gameState/QuizState';
import QuizRunningCast from 'components/cast/quiz/QuizRunningCast.vue';

const castStore = useCastStore();

const state = computed<QuizState>(() => {
  return castStore.gameState as QuizState;
});
</script>

<style scoped></style>
