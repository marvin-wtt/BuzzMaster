<template>
  <q-page padding>
    <div v-if="state.name === 'preparing'">
      Preparing

      <controller-logo style="width: 200px" />

      <ul>
        <li>Speed counts!</li>
        <li>Press the red button if you know the answer.</li>
        <li>You have x seconds to give the correct answer.</li>
        <li>If your answer is correct, you get x points.</li>
        <li>Otherwise, you get y points.</li>
        <li>You can only buzzer once!</li>
        <li>Get ready!</li>
      </ul>
    </div>
    <div v-else-if="state.name === 'running'">Running</div>
    <div v-else-if="state.name === 'answering'">
      Answering
      {{ controllers[state.controller] }}
      {{ state.time }}
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { storeToRefs } from 'pinia';
import ControllerLogo from 'components/ControllerLogo.vue';

const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const state = computed<BuzzerState>(() => {
  return castStore.gameState as BuzzerState;
});
</script>

<style scoped></style>
