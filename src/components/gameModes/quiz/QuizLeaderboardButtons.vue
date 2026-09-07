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
import { findFastestControllers } from 'components/gameModes/quiz/fastestBonus';

const leaderboardStore = useLeaderboardStore();
const { quizSettings } = useGameSettingsStore();
const { createAudio } = useAudio();

const correctAnswers = ref<Set<BuzzerButton>>(new Set());
const props = defineProps<{
  answers: Record<string, BuzzerButton>;
  answerTimes: Record<string, number>;
}>();

// Points granted for the current selection. Kept to revert them when the selection changes.
const grantedPoints = ref<Record<string, number>>({});

const emit = defineEmits<{
  (e: 'update', correct: BuzzerButton[] | undefined): void;
}>();

let audioPlayed = false;
const audioCorrect = createAudio('sounds/answer-correct.mp3');

onBeforeMount(() => {
  audioCorrect.load();
});

const updateButtonPoints = async (button: BuzzerButton): Promise<void> => {
  // Revert the points of the previous selection
  Object.entries(grantedPoints.value).forEach(([controllerId, points]) => {
    leaderboardStore.addPoints(controllerId, -points);
  });

  // Toggle the button
  if (correctAnswers.value.has(button)) {
    correctAnswers.value.delete(button);
  } else {
    correctAnswers.value.add(button);
  }

  const correct = [...correctAnswers.value];
  const points: Record<string, number> = {};

  // If all buzzers are unselected, no points are granted
  if (correct.length > 0) {
    const fastest =
      quizSettings.pointsFastestBonus === 0
        ? []
        : findFastestControllers(props.answers, props.answerTimes, correct);

    Object.entries(props.answers).forEach(([controllerId, answer]) => {
      if (!correctAnswers.value.has(answer)) {
        points[controllerId] = quizSettings.pointsWrong;
        return;
      }

      // The bonus is granted on top of the points for a correct answer
      points[controllerId] = fastest.includes(controllerId)
        ? quizSettings.pointsCorrect + quizSettings.pointsFastestBonus
        : quizSettings.pointsCorrect;
    });
  }

  Object.entries(points).forEach(([controllerId, value]) => {
    leaderboardStore.addPoints(controllerId, value);
  });

  grantedPoints.value = points;

  emit('update', correct.length === 0 ? undefined : correct);

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
