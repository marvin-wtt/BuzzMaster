<template>
  <div
    v-if="props.state.mode === 'ordering'"
    class="col-12"
  >
    <quiz-ordering-completed-cast :state="props.state" />
  </div>
  <div
    v-else-if="settings.mode === 'survey'"
    class="column justify-center"
  >
    <div class="col-8">
      <quiz-result-bar-chart
        class="fit"
        :answers="props.state.result"
        :total-answers="props.state.controllers.length"
        animated
      />
    </div>
  </div>
  <div
    v-else
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
</template>

<script lang="ts" setup>
import type {
  QuizCompleteState,
  QuizOrderingCompleteState,
} from 'app/common/gameState/QuizState';
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import type { BuzzerButton } from 'src/plugins/buzzer/types';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { useI18n } from 'vue-i18n';
import QuizCompletedResult from 'components/cast/quiz/QuizCompletedResult.vue';
import QuizResultBarChart from 'components/gameModes/quiz/QuizResultBarChart.vue';
import QuizOrderingCompletedCast from 'components/cast/quiz/QuizOrderingCompletedCast.vue';

const { t } = useI18n();
const castStore = useCastStore();

const props = defineProps<{
  state: QuizCompleteState | QuizOrderingCompleteState;
}>();

const settings = computed<QuizSettings>(() => {
  return castStore.gameSettings.quiz;
});

const showResults = computed<boolean>(() => {
  if (props.state.mode === 'ordering') {
    return true;
  }
  return props.state.correct !== undefined;
});

const correctButtons = computed<BuzzerButton[] | undefined>(() => {
  if (props.state.mode === 'ordering') {
    return undefined;
  }
  return props.state.correct === undefined
    ? undefined
    : [...props.state.correct].sort();
});

const wrongButtons = computed<BuzzerButton[] | undefined>(() => {
  if (props.state.mode === 'ordering') {
    return undefined;
  }
  const correct = props.state.correct;
  if (!correct) {
    return undefined;
  }

  const allButtons = settings.value.activeButtons;

  return allButtons.filter((value) => !correct.includes(value));
});
</script>

<style scoped></style>
