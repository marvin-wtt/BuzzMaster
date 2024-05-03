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
      :settings="settings"
    />
    <buzzer-answered-cast
      v-else-if="state.name === 'answered'"
      :state="state"
    />
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import { BuzzerState } from 'app/common/gameState/BuzzerState';
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import BuzzerPreparingCast from 'components/cast/buzzer/BuzzerPreparingCast.vue';
import BuzzerRunningCast from 'components/cast/buzzer/BuzzerRunningCast.vue';
import BuzzerAnsweringCast from 'components/cast/buzzer/BuzzerAnsweringCast.vue';
import BuzzerAnsweredCast from 'components/cast/buzzer/BuzzerAnsweredCast.vue';

const castStore = useCastStore();

const settings = computed<BuzzerSettings>(() => {
  return castStore.gameSettings.buzzer;
});

const state = computed<BuzzerState>(() => {
  return castStore.gameState as BuzzerState;
});
</script>

<style scoped></style>
