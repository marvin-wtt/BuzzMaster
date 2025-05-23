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
import type { IController } from 'src/plugins/buzzer/types';
import { useAudio } from 'src/composables/audio';

const leaderboardStore = useLeaderboardStore();
const { buzzerSettings } = useGameSettingsStore();
const { createAudio } = useAudio();

const props = defineProps<{
  controller: IController;
}>();

const emit = defineEmits<{
  (e: 'update', correct: boolean | undefined, points: number | undefined): void;
}>();

const audioCorrect = createAudio('sounds/answer-correct.mp3');
const audioWrong = createAudio('sounds/answer-wrong.mp3');

onBeforeMount(() => {
  audioCorrect.load();
  audioWrong.load();
});

const answerCorrect = ref<boolean>();

const onAnswerChange = async (answer: boolean) => {
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

  await playAudio(answer);
};

const playAudio = async (answer: boolean) => {
  if (answer) {
    await audioCorrect.play();
  } else {
    await audioWrong.play();
  }
};

const updateLeaderboard = (points: number) => {
  leaderboardStore.addPoints(props.controller.id, points);
};
</script>

<style scoped></style>
