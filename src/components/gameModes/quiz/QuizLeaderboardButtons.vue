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
  answerTimes?: Record<string, number>;
}>();

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
  // Revert previously granted points
  Object.entries(grantedPoints.value).forEach(([controllerId, pts]) => {
    leaderboardStore.addPoints(controllerId, -pts);
  });

  // Toggle button correctness
  if (correctAnswers.value.has(button)) {
    correctAnswers.value.delete(button);
  } else {
    correctAnswers.value.add(button);
  }

  // Calculate new points
  const newGrantedPoints: Record<string, number> = {};

  if (correctAnswers.value.size > 0) {
    let fastestControllers: string[] = [];
    let maxTime = -1;

    // Find the fastest correct controllers when in 'fastest-bonus' mode.
    // The fastest players receive a distinct fixed point reward instead of the standard reward.
    if (quizSettings.mode === 'fastest-bonus' && props.answerTimes) {
      Object.entries(props.answers).forEach(([controllerId, ans]) => {
        if (correctAnswers.value.has(ans)) {
          const time = props.answerTimes![controllerId] || 0;
          if (time > maxTime) {
            maxTime = time;
            fastestControllers = [controllerId];
          } else if (time === maxTime) {
            fastestControllers.push(controllerId);
          }
        }
      });
    }

    // Assign points
    Object.entries(props.answers).forEach(([controllerId, ans]) => {
      if (correctAnswers.value.has(ans)) {
        // If the controller is the fastest in fastest-bonus mode, award the fixed fastest bonus points.
        // Otherwise, award the standard correct points.
        let pts = quizSettings.pointsCorrect;
        if (fastestControllers.includes(controllerId)) {
          pts = quizSettings.pointsFastestBonus;
        }
        newGrantedPoints[controllerId] = pts;
      } else {
        newGrantedPoints[controllerId] = quizSettings.pointsWrong;
      }
    });
  }

  // Apply new points
  Object.entries(newGrantedPoints).forEach(([controllerId, pts]) => {
    leaderboardStore.addPoints(controllerId, pts);
  });

  grantedPoints.value = newGrantedPoints;

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
