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

const { quizSettings } = useGameSettingsStore();

const icon = computed<string>(() => {
  return quizSettings.presentationView === 'bar-chart'
    ? 'view_list'
    : 'bar_chart';
});

const togglePresentationMode = () => {
  quizSettings.presentationView =
    quizSettings.presentationView === 'bar-chart' ? 'table' : 'bar-chart';
};
</script>

<style scoped></style>
