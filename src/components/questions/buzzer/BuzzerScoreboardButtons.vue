<template>
  <div class="row justify-center reverse">
    <q-btn
      aria-label="correct"
      icon="check"
      color="positive"
      class="q-mx-sm"
      rounded
      :outline="answerCorrect !== true"
      @click="onAnswerChange(true)"
    />

    <q-btn
      aria-label="wrong"
      icon="clear"
      color="negative"
      class="q-mx-sm"
      rounded
      :outline="answerCorrect !== false"
      @click="onAnswerChange(false)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useScoreboardStore } from 'stores/scoreboard-store';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { IController } from 'src/plugins/buzzer/types';

const scoreBoardStore = useScoreboardStore();
const { buzzerSettings } = useQuestionSettingsStore();

const props = defineProps<{
  controller: IController;
}>();

const answerCorrect = ref<boolean>();

const onAnswerChange = (answer: boolean) => {
  const points = answer
    ? buzzerSettings.pointsCorrect
    : buzzerSettings.pointsWrong;

  // Take back points if button is pressed again
  if (answerCorrect.value === answer) {
    answerCorrect.value = undefined;
    updateScoreboard(points * -1);
    return;
  }

  // Take back positive points if selection was switched
  if (answerCorrect.value !== undefined) {
    const refundPoints = answer
      ? buzzerSettings.pointsWrong
      : buzzerSettings.pointsCorrect;
    updateScoreboard(refundPoints * -1);
  }

  answerCorrect.value = answer;
  updateScoreboard(points);
};

const updateScoreboard = (points: number) => {
  scoreBoardStore.addPoints(props.controller.id, points);
};
</script>

<style scoped></style>
