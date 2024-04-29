<template>
  <q-page padding>
    <div v-if="state.name === 'preparing'">
      Preparing

      <img
        ref="controllerLogo"
        :src="ControllerLogo"
        alt="controller-logo"
        style="aspect-ratio: 1/1"
        width="200px"
      />

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
import { computed, ref } from 'vue';
import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { storeToRefs } from 'pinia';
import ControllerLogo from 'app/public/logo.svg';

const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const controllerLogo = ref<SVGElement>();

setTimeout(() => {
  const btn = controllerLogo.value?.querySelector('#btn-blue');
  if (btn) {
    console.log(btn);
  }
}, 1000);

const state = computed<BuzzerState>(() => {
  return castStore.gameState as BuzzerState;
});
</script>

<style scoped></style>
