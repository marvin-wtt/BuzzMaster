<template>
  <div class="row justify-center q-gutter-sm">
    <q-btn
      v-for="button in quizSettings.activeButtons"
      :key="button"
      :color="buzzerButtonColor[button]"
      size="sm"
      round
      style="border-width: 20px"
      :outline="!correctAnswers.has(button)"
      @click="updateButtonPoints(button)"
    />
  </div>
</template>

<script lang="ts" setup>
import { buzzerButtonColor } from 'components/buttonColors';
import type { BuzzerButton } from 'src/plugins/buzzer/types';
import { onBeforeMount, ref } from 'vue';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useAudio } from 'src/composables/audio';

const leaderboardStore = useLeaderboardStore();
const { quizSettings } = useGameSettingsStore();
const { createAudio } = useAudio();

const correctAnswers = ref<Set<BuzzerButton>>(new Set());
const props = defineProps<{
  answers: Record<string, BuzzerButton>;
}>();

const emit = defineEmits<{
  (e: 'update', correct: BuzzerButton[] | undefined): void;
}>();

let audioPlayed = false;
const audioCorrect = createAudio('sounds/answer-correct.mp3');

onBeforeMount(() => {
  audioCorrect.load();
});

const updateButtonPoints = async (button: BuzzerButton): Promise<void> => {
  // No button was preciously pressed, so we assume all answers are wrong.
  // Points for correct answers are refunded later
  if (correctAnswers.value.size === 0) {
    Object.keys(props.answers).forEach((controllerId) => {
      leaderboardStore.addPoints(controllerId, quizSettings.pointsWrong);
    });
  }

  if (correctAnswers.value.has(button)) {
    // Add wrong point and refund correct points
    Object.keys(props.answers)
      .filter((controllerId) => props.answers[controllerId] === button)
      .forEach((controllerId) => {
        leaderboardStore.addPoints(
          controllerId,
          quizSettings.pointsCorrect * -1,
        );
        leaderboardStore.addPoints(controllerId, quizSettings.pointsWrong);
      });

    correctAnswers.value.delete(button);
  } else {
    // Add correct point and refund wrong points
    Object.keys(props.answers)
      .filter((controllerId) => props.answers[controllerId] === button)
      .forEach((controllerId) => {
        leaderboardStore.addPoints(controllerId, quizSettings.pointsWrong * -1);
        leaderboardStore.addPoints(controllerId, quizSettings.pointsCorrect);
      });

    correctAnswers.value.add(button);
  }

  // If all buzzers are unselected, no points are granted
  if (correctAnswers.value.size === 0) {
    Object.keys(props.answers).forEach((controllerId) => {
      leaderboardStore.addPoints(controllerId, quizSettings.pointsWrong * -1);
    });
  }

  emit(
    'update',
    correctAnswers.value.size === 0 ? undefined : [...correctAnswers.value],
  );

  await playAudio();
};

const playAudio = async () => {
  // Only play sound once as multiple answers can be selected
  if (audioPlayed) {
    return;
  }

  audioPlayed = true;
  await audioCorrect.play();
};
</script>

<style scoped></style>
