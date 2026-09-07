<template>
  <div
    v-if="settings.mode === 'survey'"
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
    class="column no-wrap result-column"
  >
    <!-- Correct -->
    <quiz-completed-result
      symbol="check"
      :buttons="correctButtons"
      :show-result="showResults"
      :points="settings.pointsCorrect"
    >
      {{ t('cast.quiz.completed.points') }}

      <template #bonus>
        <div
          v-if="fastestControllers.length > 0"
          class="column items-center text-warning"
        >
          <div class="row items-center justify-center no-wrap bonus-title">
            <q-icon
              name="bolt"
              class="q-mr-xs"
            />
            {{ n(settings.pointsFastestBonus, { signDisplay: 'exceptZero' }) }}
            &nbsp;{{ t('cast.quiz.completed.fastestBonus') }}
          </div>

          <div
            v-for="controllerId in fastestControllers"
            :key="controllerId"
            class="bonus-winner ellipsis"
          >
            {{ castStore.controllers[controllerId] ?? controllerId }} &middot;
            {{
              t('cast.quiz.completed.seconds', {
                n: reactionTime(controllerId),
              })
            }}
          </div>
        </div>
      </template>
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
import type { QuizCompleteState } from '@/../common/gameState/QuizState';
import { useCastStore } from '@/stores/cast-store';
import { computed } from 'vue';
import type { BuzzerButton } from '@/plugins/buzzer/types';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import { useI18n } from 'vue-i18n';
import QuizCompletedResult from '@/components/cast/quiz/QuizCompletedResult.vue';
import QuizResultBarChart from '@/components/gameModes/quiz/QuizResultBarChart.vue';
import { findFastestControllers } from 'components/gameModes/quiz/fastestBonus';

const { t, n } = useI18n();
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

  const allButtons = settings.value.activeButtons;

  return allButtons.filter((value) => !props.state.correct?.includes(value));
});

// Controllers that earned the bonus for the fastest correct answer
const fastestControllers = computed<string[]>(() => {
  if (settings.value.pointsFastestBonus === 0) {
    return [];
  }

  return findFastestControllers(
    props.state.result,
    props.state.answerTimes,
    props.state.correct,
  );
});

const reactionTime = (controllerId: string): string => {
  const time = props.state.answerTimes[controllerId] ?? 0;

  return Math.max(0, settings.value.answerTime - time).toFixed(1);
};
</script>

<style scoped>
/* The cast window is often only a few hundred pixels wide, so the result fills
   the available width and all sizes scale with it. */
.result-column {
  width: min(100%, 40rem);
}

.bonus-title {
  font-size: clamp(1.1rem, 5vw, 2.25rem);
  font-weight: 600;
  line-height: 1.3;
}

.bonus-winner {
  max-width: 100%;
  font-size: clamp(0.9rem, 3.5vw, 1.5rem);
  line-height: 1.4;
  opacity: 0.8;
}
</style>
