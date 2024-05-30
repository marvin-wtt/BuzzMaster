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
import { onBeforeMount, ref } from 'vue';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { IController } from 'src/plugins/buzzer/types';

const leaderboardStore = useLeaderboardStore();
const { buzzerSettings } = useGameSettingsStore();

const props = defineProps<{
  controller: IController;
}>();

const emit = defineEmits<{
  (e: 'update', correct: boolean | undefined, points: number | undefined): void;
}>();

const audioCorrect = new Audio('sounds/answer-correct.mp3');
const audioWrong = new Audio('sounds/answer-wrong.mp3');

onBeforeMount(() => {
  audioCorrect.load();
  audioWrong.load();
});

const answerCorrect = ref<boolean>();

const onAnswerChange = (answer: boolean) => {
  const points = answer
    ? buzzerSettings.pointsCorrect
    : buzzerSettings.pointsWrong;

  // Take back points if button is pressed again
  if (answerCorrect.value === answer) {
    answerCorrect.value = undefined;
    updateLeaderboard(points * -1);
    emit('update', undefined, undefined);
    return;
  }

  // Take back positive points if selection was switched
  if (answerCorrect.value !== undefined) {
    const refundPoints = answer
      ? buzzerSettings.pointsWrong
      : buzzerSettings.pointsCorrect;
    updateLeaderboard(refundPoints * -1);
  }

  answerCorrect.value = answer;
  updateLeaderboard(points);
  emit('update', answer, points);

  playAudio(answer);
};

const playAudio = (answer: boolean) => {
  if (answer) {
    audioCorrect.play();
  } else {
    audioWrong.play();
  }
};

const updateLeaderboard = (points: number) => {
  leaderboardStore.addPoints(props.controller.id, points);
};
</script>

<style scoped></style>
