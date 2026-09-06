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
    class="column text-h2"
  >
    <!-- Fastest -->
    <template
      v-if="settings.mode === 'fastest-bonus' && fastestControllers.length"
    >
      <quiz-completed-result
        symbol="timer"
        :buttons="fastestButtons"
        :show-result="showResults"
        :points="settings.pointsFastestBonus"
        :state="props.state"
        :filter-controllers="fastestControllers"
      >
        {{ t('cast.quiz.completed.points') }}
      </quiz-completed-result>

      <q-separator />
    </template>

    <!-- Correct -->
    <template
      v-if="correctButtonsFiltered && correctButtonsFiltered.length > 0"
    >
      <quiz-completed-result
        symbol="check"
        :buttons="correctButtonsFiltered"
        :show-result="showResults"
        :points="settings.pointsCorrect"
        :state="props.state"
        :filter-controllers="correctControllersWithoutFastest"
      >
        {{ t('cast.quiz.completed.points') }}
      </quiz-completed-result>

      <q-separator />
    </template>

    <!-- Wrong -->
    <quiz-completed-result
      symbol="cross"
      :buttons="wrongButtons"
      :show-result="showResults"
      :points="settings.pointsWrong"
      :state="props.state"
    >
      {{ t('cast.quiz.completed.points') }}
    </quiz-completed-result>
  </div>
</template>

<script lang="ts" setup>
import type { QuizCompleteState } from 'app/common/gameState/QuizState';
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import type { BuzzerButton } from 'src/plugins/buzzer/types';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';
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

const correctButtonsFiltered = computed<BuzzerButton[] | undefined>(() => {
  if (props.state.correct === undefined) {
    return undefined;
  }

  if (
    settings.value.mode !== 'fastest-bonus' ||
    fastestControllers.value.length === 0
  ) {
    return [...props.state.correct].sort();
  }

  return [...props.state.correct]
    .filter((btn) => {
      const nonFastestForBtn = correctControllersWithoutFastest.value.find(
        (id) => props.state.result[id] === btn,
      );
      const anyoneForBtn = Object.values(props.state.result).includes(btn);
      return nonFastestForBtn || !anyoneForBtn;
    })
    .sort();
});

const wrongButtons = computed<BuzzerButton[] | undefined>(() => {
  if (!props.state.correct) {
    return undefined;
  }

  const allButtons = settings.value.activeButtons;

  return allButtons.filter((value) => !props.state.correct?.includes(value));
});

// Computes the fastest correct controllers in 'fastest-bonus' mode.
// These controllers are extracted to be displayed in their own dedicated podium section on the cast screen.
const fastestControllers = computed<string[]>(() => {
  if (settings.value.mode !== 'fastest-bonus' || !props.state.correct) {
    return [];
  }

  let fastest: string[] = [];
  let maxTime = -1;
  const correctSet = new Set(props.state.correct);

  Object.entries(props.state.result).forEach(([controllerId, ans]) => {
    if (correctSet.has(ans)) {
      const time = props.state.answerTimes?.[controllerId] || 0;
      if (time > maxTime) {
        maxTime = time;
        fastest = [controllerId];
      } else if (time === maxTime) {
        fastest.push(controllerId);
      }
    }
  });

  return fastest;
});

// Computes the remaining correct controllers, omitting the fastest ones.
// This prevents the fastest players from being rendered twice (both in the fastest podium and the standard correct section).
const correctControllersWithoutFastest = computed<string[]>(() => {
  if (settings.value.mode !== 'fastest-bonus') {
    return Object.keys(props.state.result);
  }
  return Object.keys(props.state.result).filter(
    (id) => !fastestControllers.value.includes(id),
  );
});

const fastestButtons = computed<BuzzerButton[] | undefined>(() => {
  if (!props.state.correct || fastestControllers.value.length === 0)
    return undefined;

  const buttons = new Set<BuzzerButton>();
  fastestControllers.value.forEach((id) => {
    const btn = props.state.result[id];
    if (btn !== undefined) {
      buttons.add(btn);
    }
  });
  return [...buttons].sort();
});
</script>

<style scoped></style>
