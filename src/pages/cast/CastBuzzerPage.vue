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
    <div v-else-if="state.name === 'answering'">
      Answering
      {{ controllers[state.controller] }}
      {{ state.time }}
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed, reactive } from 'vue';
import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { storeToRefs } from 'pinia';
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import BuzzerPreparingCast from 'components/cast/buzzer/BuzzerPreparingCast.vue';
import BuzzerRunningCast from 'components/cast/buzzer/BuzzerRunningCast.vue';

const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

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
