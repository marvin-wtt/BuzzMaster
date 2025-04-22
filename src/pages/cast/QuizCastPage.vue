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
    <quiz-completed-cast
      v-else-if="state.name === 'completed'"
      :state="state"
    />
  </q-page>
</template>

<script lang="ts" setup>
import QuizPreparingCast from 'components/cast/quiz/QuizPreparingCast.vue';

import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import type { QuizState } from 'app/common/gameState/QuizState';
import QuizRunningCast from 'components/cast/quiz/QuizRunningCast.vue';
import QuizCompletedCast from 'components/cast/quiz/QuizCompletedCast.vue';

const castStore = useCastStore();

const state = computed<QuizState>(() => {
  return castStore.gameState as QuizState;
});
</script>

<style scoped></style>
