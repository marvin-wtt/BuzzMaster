<template>
  <div class="col-12 column no-wrap q-gutter-md">
    <div class="text-h6 text-center">
      {{ t('gameMode.quiz.ordering.submittedAnswers') }}
    </div>
    <q-list
      bordered
      separator
      class="rounded-borders col-grow ordering-answers"
    >
      <q-item
        v-for="controllerId in state.controllers"
        :key="controllerId"
      >
        <q-item-section avatar>
          <q-icon
            :name="answerIcon(controllerId)"
            :color="answerColor(controllerId)"
          />
        </q-item-section>
        <q-item-section>
          {{ controllerNames[controllerId] ?? controllerId }}
        </q-item-section>
        <q-item-section side>
          <div
            v-if="state.result[controllerId]?.length"
            class="row q-gutter-xs"
          >
            <q-avatar
              v-for="(button, index) in state.result[controllerId]"
              :key="index"
              :color="buzzerButtonColor[button]"
              text-color="white"
              size="sm"
            >
              {{ index + 1 }}
            </q-avatar>
          </div>
          <span
            v-else
            class="text-grey"
          >
            {{ t('gameMode.quiz.ordering.noAnswer') }}
          </span>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import type { QuizOrderingCompleteState } from 'app/common/gameState/QuizState';
import { buzzerButtonColor } from 'components/buttonColors';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  state: QuizOrderingCompleteState;
  controllerNames: Record<string, string>;
}>();

const answerCorrect = (controllerId: string): boolean => {
  if (!props.state.correct) {
    return false;
  }

  const answer = props.state.result[controllerId];
  return (
    answer?.length === props.state.correct.length &&
    answer.every((button, index) => button === props.state.correct?.[index])
  );
};

const answerIcon = (controllerId: string): string => {
  if (!props.state.correct) {
    return 'pending';
  }

  return answerCorrect(controllerId) ? 'check' : 'close';
};

const answerColor = (controllerId: string): string => {
  if (!props.state.correct) {
    return 'grey';
  }

  return answerCorrect(controllerId) ? 'positive' : 'negative';
};
</script>

<style scoped>
.ordering-answers {
  min-height: 12rem;
  overflow-y: auto;
}
</style>
