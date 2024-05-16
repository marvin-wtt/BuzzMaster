<template>
  <div
    v-if="settings.mode === 'quiz'"
    class="column text-h2"
  >
    <!-- Correct -->
    <quiz-completed-result
      symbol="check"
      :buttons="correctButtons"
      :show-result="showResults"
      :points="settings.pointsCorrect"
    >
      {{ t('cast.quiz.completed.points') }}
    </quiz-completed-result>

    <q-separator />

    <!-- Wrong -->
    <quiz-completed-result
      symbol="cross"
      :buttons="wrongButtons"
      :show-result="showResults"
      :points="settings.pointsWrong"
    >
      {{ t('cast.quiz.completed.points') }}
    </quiz-completed-result>
  </div>

  <div
    v-else-if="settings.mode === 'survey'"
    class="self-center"
  >
    <quiz-result-bar-chart :controllers-by-button="buttonsByControllers" />
  </div>
</template>

<script lang="ts" setup>
import { QuizCompleteState } from 'app/common/gameState/QuizState';
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { useI18n } from 'vue-i18n';
import QuizCompletedResult from 'components/cast/quiz/QuizCompletedResult.vue';
import QuizResultBarChart from 'components/gameModes/quiz/QuizResultBarChart.vue';

const { t } = useI18n();
const castStore = useCastStore();

const props = defineProps<{
  state: QuizCompleteState;
}>();

const settings = computed<QuizSettings>(() => {
  return castStore.gameSettings.quiz;
});

const showResults = computed<boolean>(() => {
  return props.state.correct !== undefined;
});

const correctButtons = computed<BuzzerButton[] | undefined>(() => {
  return props.state.correct === undefined
    ? undefined
    : [...props.state.correct].sort();
});

const wrongButtons = computed<BuzzerButton[] | undefined>(() => {
  if (!props.state.correct) {
    return undefined;
  }

  const allButtons = [
    BuzzerButton.BLUE,
    BuzzerButton.ORANGE,
    BuzzerButton.GREEN,
    BuzzerButton.YELLOW,
  ];

  return allButtons.filter((value) => !props.state.correct?.includes(value));
});

interface ControllerLike {
  id: string;
  name: string;
}

const buttonsByControllers = computed<Record<BuzzerButton, ControllerLike[]>>(
  () => {
    return Object.keys(props.state.result).reduce(
      (acc, controllerId) => {
        // Mo input is default button
        const pressedButton =
          controllerId in props.state.result
            ? props.state.result[controllerId]
            : undefined;
        // Ignore input if user has not confirmed the button selection
        const button = pressedButton ?? BuzzerButton.RED;

        acc[button] ??= [];
        acc[button].push({
          id: controllerId,
          name: castStore.controllers[controllerId],
        });

        return acc;
      },
      {} as Record<BuzzerButton, ControllerLike[]>,
    );
  },
);
</script>

<style scoped></style>
