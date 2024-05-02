<template>
  <q-page
    class="row justify-center"
    padding
  >
    <buzzer-preparing-cast
      v-if="state.name === 'preparing'"
      :settings="settings"
    />
    <buzzer-running-cast v-else-if="state.name === 'running'" />
    <buzzer-answering-cast
      v-else-if="state.name === 'answering'"
      :state="state"
    />
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed, reactive } from 'vue';
import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import BuzzerPreparingCast from 'components/cast/buzzer/BuzzerPreparingCast.vue';
import BuzzerRunningCast from 'components/cast/buzzer/BuzzerRunningCast.vue';
import BuzzerAnsweringCast from 'components/cast/buzzer/BuzzerAnsweringCast.vue';

const castStore = useCastStore();

// TODO Get from main window
const settings = reactive<BuzzerSettings>({
  answerTime: 10,
  multipleAttempts: true,
  pointsCorrect: 10,
  pointsWrong: -20,
} as BuzzerSettings);

const state = computed<BuzzerState>(() => {
  return castStore.gameState as BuzzerState;
});
</script>

<style scoped></style>
