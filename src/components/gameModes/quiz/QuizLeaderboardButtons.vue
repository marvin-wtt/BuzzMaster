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
      @click="updateButtonScore(button)"
    />
  </div>
</template>

<script lang="ts" setup>
import { buzzerButtonColor } from 'components/buttonColors';
import { BuzzerButton, IController } from 'src/plugins/buzzer/types';
import { onBeforeMount, ref } from 'vue';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useBuzzer } from 'src/plugins/buzzer';

const leaderboardStore = useLeaderboardStore();
const { quizSettings } = useGameSettingsStore();
const { controllers } = useBuzzer();

const correctAnswers = ref<Set<BuzzerButton>>(new Set());
const props = defineProps<{
  controllerValues: Record<BuzzerButton, IController[] | undefined>;
}>();

const emit = defineEmits<{
  (e: 'update', correct: BuzzerButton[] | undefined): void;
}>();

let audioPlayed = false;
const audioCorrect = new Audio('sounds/answer-correct.mp3');

onBeforeMount(() => {
  audioCorrect.load();
});

const updateButtonScore = (button: BuzzerButton): void => {
  // No button was preciously pressed, so we assume all answers are wrong.
  // Points for correct answers are refunded later
  if (correctAnswers.value.size === 0) {
    controllers.value.forEach((controller) => {
      leaderboardStore.addPoints(controller.id, quizSettings.pointsWrong);
    });
  }

  if (correctAnswers.value.has(button)) {
    // Add wrong point and refund correct points
    props.controllerValues[button]?.forEach((controller) => {
      leaderboardStore.addPoints(
        controller.id,
        quizSettings.pointsCorrect * -1,
      );
      leaderboardStore.addPoints(controller.id, quizSettings.pointsWrong);
    });

    correctAnswers.value.delete(button);
  } else {
    // Add correct point and refund wrong points
    props.controllerValues[button]?.forEach((controller) => {
      leaderboardStore.addPoints(controller.id, quizSettings.pointsWrong * -1);
      leaderboardStore.addPoints(controller.id, quizSettings.pointsCorrect);
    });

    correctAnswers.value.add(button);
  }

  // If all buzzers are unselected, no points are granted
  if (correctAnswers.value.size === 0) {
    controllers.value.forEach((controller) => {
      leaderboardStore.addPoints(controller.id, quizSettings.pointsWrong * -1);
    });
  }

  emit(
    'update',
    correctAnswers.value.size === 0 ? undefined : [...correctAnswers.value],
  );

  playAudio();
};

const playAudio = () => {
  // Only play sound once as multiple answers can be selected
  if (audioPlayed) {
    return;
  }

  audioPlayed = true;
  audioCorrect.play();
};
</script>

<style scoped></style>
