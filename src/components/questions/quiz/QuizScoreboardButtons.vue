<template>
  <div class="row justify-center q-gutter-sm">
    <q-btn
      v-for="button in quizSettings.activeButtons"
      :key="button"
      :color="buzzerButtonColor[button]"
      size="sm"
      round
      class="scoreboard-btm"
      style="border-width: 20px"
      :outline="!correctAnswers.has(button)"
      @click="updateButtonScore(button)"
    />
  </div>
</template>

<script lang="ts" setup>
import { buzzerButtonColor } from 'components/buttonColors';
import { BuzzerButton, IController } from 'src/plugins/buzzer/types';
import { ref } from 'vue';
import { useScoreboardStore } from 'stores/scoreboard-store';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { useBuzzer } from 'src/plugins/buzzer';

const scoreboardStore = useScoreboardStore();
const { quizSettings } = useQuestionSettingsStore();
const { controllers } = useBuzzer();

const correctAnswers = ref<Set<BuzzerButton>>(new Set());
const props = defineProps<{
  controllerValues: Record<BuzzerButton, IController[] | undefined>;
}>();

const updateButtonScore = (button: BuzzerButton): void => {
  // No button was preciously pressed, so we assume all answers are wrong.
  // Points for correct answers are refunded later
  if (correctAnswers.value.size === 0) {
    controllers.value.forEach((controller) => {
      scoreboardStore.addPoints(controller.id, quizSettings.pointsWrong);
    });
  }

  if (correctAnswers.value.has(button)) {
    // Add wrong point and refund correct points
    props.controllerValues[button]?.forEach((controller) => {
      scoreboardStore.addPoints(controller.id, quizSettings.pointsCorrect * -1);
      scoreboardStore.addPoints(controller.id, quizSettings.pointsWrong);
    });

    correctAnswers.value.delete(button);
  } else {
    // Add correct point and refund wrong points
    props.controllerValues[button]?.forEach((controller) => {
      scoreboardStore.addPoints(controller.id, quizSettings.pointsWrong * -1);
      scoreboardStore.addPoints(controller.id, quizSettings.pointsCorrect);
    });

    correctAnswers.value.add(button);
  }

  // If all buzzers are unselected, no points are granted
  if (correctAnswers.value.size === 0) {
    controllers.value.forEach((controller) => {
      scoreboardStore.addPoints(controller.id, quizSettings.pointsWrong * -1);
    });
  }
};
</script>

<style scoped></style>
