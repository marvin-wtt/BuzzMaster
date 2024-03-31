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
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { computed } from 'vue';

const { quizSettings } = useQuestionSettingsStore();

const icon = computed<string>(() => {
  return quizSettings.resultMode === 'bar' ? 'view_list' : 'bar_chart';
});

const togglePresentationMode = () => {
  quizSettings.resultMode = quizSettings.resultMode === 'bar' ? 'table' : 'bar';
};
</script>

<style scoped></style>
