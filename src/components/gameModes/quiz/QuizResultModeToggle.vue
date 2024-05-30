<template>
  <teleport to="#navbar-action">
    <q-btn
      :icon="icon"
      size="md"
      rounded
      flat
      dense
      @click="togglePresentationMode"
    />
  </teleport>
</template>

<script lang="ts" setup>
import { useGameSettingsStore } from 'stores/game-settings-store';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

const quizSettingsStore = useGameSettingsStore();
const { quizSettings } = storeToRefs(quizSettingsStore);

const icon = computed<string>(() => {
  return quizSettings.value.presentationView === 'bar-chart'
    ? 'view_list'
    : 'bar_chart';
});

const togglePresentationMode = () => {
  quizSettings.value.presentationView =
    quizSettings.value.presentationView === 'bar-chart' ? 'table' : 'bar-chart';
};
</script>

<style scoped></style>
