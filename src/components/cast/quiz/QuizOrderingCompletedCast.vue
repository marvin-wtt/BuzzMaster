<template>
  <div class="ordering-completed col-12">
    <transition-fade>
      <div
        v-if="props.state.correct"
        class="result-content"
      >
        <header class="text-center">
          <div class="result-title">
            {{ t('cast.quiz.completed.correctOrder') }}
          </div>
        </header>

        <div class="sequence">
          <div
            v-for="(button, index) in props.state.correct"
            :key="button"
            class="sequence-step"
          >
            <div class="step-number">
              {{ index + 1 }}
            </div>
            <div
              class="button-color"
              :class="buzzerButtonBgColor[button]"
            />
          </div>
        </div>

        <div class="score">
          <q-icon
            name="check_circle"
            color="positive"
            class="score-icon"
          />
          <div>
            <div class="score-value">
              {{ orderingCorrect }} / {{ props.state.controllers.length }}
            </div>
            <div class="score-label">
              {{ t('cast.quiz.completed.correctAnswers') }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="waiting-content text-center"
      >
        <q-spinner-dots
          color="primary"
          class="waiting-spinner"
        />
        <div class="waiting-title">
          {{ t('cast.quiz.completed.waitingForCorrectOrder') }}
        </div>
        <div class="waiting-hint">
          {{ t('cast.quiz.completed.waitingForModerator') }}
        </div>
      </div>
    </transition-fade>
  </div>
</template>

<script lang="ts" setup>
import type { QuizOrderingCompleteState } from 'app/common/gameState/QuizState';
import TransitionFade from 'components/TransitionFade.vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  state: QuizOrderingCompleteState;
}>();

const orderingCorrect = computed<number>(() => {
  const correct = props.state.correct;
  if (!correct) {
    return 0;
  }

  return Object.values(props.state.result).filter(
    (answer) =>
      answer.length === correct.length &&
      answer.every((button, index) => button === correct[index]),
  ).length;
});

const buzzerButtonBgColor = {
  [BuzzerButton.BLUE]: 'bg-blue',
  [BuzzerButton.ORANGE]: 'bg-orange',
  [BuzzerButton.GREEN]: 'bg-green',
  [BuzzerButton.YELLOW]: 'bg-yellow',
  [BuzzerButton.RED]: 'bg-grey',
};
</script>

<style scoped>
.ordering-completed {
  display: flex;
  min-width: 0;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 4vw, 4rem);
}

.result-content,
.waiting-content {
  width: min(100%, 64rem);
}

.result-content {
  display: grid;
  gap: clamp(1.5rem, 5vh, 4rem);
}

.result-title,
.waiting-title {
  font-size: clamp(1.75rem, 5vw, 3.75rem);
  font-weight: 700;
  line-height: 1.1;
}

.sequence {
  display: flex;
  flex-direction: column;
  width: min(100%, 28rem);
  justify-self: center;
  justify-content: center;
  gap: clamp(0.5rem, 1.5vh, 1rem);
}

.sequence-step {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
  min-height: clamp(4rem, 10vh, 6rem);
  padding: clamp(0.5rem, 1.5vh, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  border: 1px solid rgba(127, 127, 127, 0.35);
  border-radius: clamp(1rem, 2vw, 1.5rem);
  background: rgba(127, 127, 127, 0.1);
}

.step-number {
  width: 2ch;
  color: rgba(127, 127, 127, 0.9);
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 700;
  text-align: center;
}

.button-color {
  width: clamp(2.75rem, 8vh, 4.5rem);
  height: clamp(2.75rem, 8vh, 4.5rem);
  border-radius: 50%;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.22);
}

.score {
  display: flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  justify-self: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 3vw, 2rem);
  border-radius: 1.25rem;
  background: rgba(127, 127, 127, 0.12);
}

.score-icon {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
}

.score-value {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1;
}

.score-label,
.waiting-hint {
  color: rgba(127, 127, 127, 0.95);
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

.waiting-content {
  display: grid;
  justify-items: center;
  gap: clamp(1rem, 3vh, 2rem);
}

.waiting-spinner {
  font-size: clamp(4rem, 14vw, 9rem);
}

@media (max-height: 520px) {
  .ordering-completed {
    align-items: flex-start;
    padding-block: 1rem;
  }

  .result-content {
    gap: 1rem;
  }

  .sequence-step {
    min-height: 3rem;
    padding-block: 0.25rem;
  }

  .button-color {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
