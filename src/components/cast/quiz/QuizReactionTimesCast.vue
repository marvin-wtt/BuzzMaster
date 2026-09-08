<template>
  <div class="column no-wrap justify-center reaction-column">
    <div class="row items-center justify-center no-wrap title">
      <q-icon
        name="speed"
        class="q-mr-sm"
      />
      {{ t('cast.quiz.completed.reactionTimes.title') }}
    </div>

    <div
      v-if="reactionTimes.length === 0"
      class="text-center entry"
      data-testid="reaction-times-empty"
    >
      {{ t('cast.quiz.completed.reactionTimes.empty') }}
    </div>

    <transition-group
      v-else
      name="entry"
      tag="div"
      class="column no-wrap"
    >
      <div
        v-for="(entry, index) in visibleReactionTimes"
        :key="entry.controllerId"
        class="row items-center no-wrap entry"
        data-testid="reaction-time-entry"
      >
        <div class="rank text-center">{{ index + 1 }}</div>
        <div class="col-grow ellipsis q-px-sm">
          {{ castStore.controllers[entry.controllerId] ?? entry.controllerId }}
        </div>
        <div class="text-weight-bold">
          {{
            t('cast.quiz.completed.seconds', {
              n: formatReactionTime(entry.reactionTime),
            })
          }}
        </div>
      </div>
    </transition-group>

    <div
      v-if="hiddenCount > 0"
      class="text-center more"
      data-testid="reaction-times-more"
    >
      {{ t('cast.quiz.completed.reactionTimes.more', { n: hiddenCount }) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastStore } from '@/stores/cast-store';
import type { QuizCompleteState } from '@/../common/gameState/QuizState';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import {
  formatReactionTime,
  rankReactionTimes,
  type ReactionTime,
} from '@/components/gameModes/quiz/reactionTimes';

// The cast window is small and the audience can only take in so many names, so
// the ranking is cut off after the fastest few players.
const MAX_ENTRIES = 8;

const { t } = useI18n();
const castStore = useCastStore();

const props = defineProps<{
  state: QuizCompleteState;
}>();

const settings = computed<QuizSettings>(() => castStore.gameSettings.quiz);

const reactionTimes = computed<ReactionTime[]>(() => {
  const ranking = rankReactionTimes(
    props.state.result,
    props.state.answerTimes,
    settings.value.answerTime,
    props.state.correct,
  );

  // Once the correct answer is revealed, a wrong answer is not worth a rank
  return props.state.correct === undefined
    ? ranking
    : ranking.filter(({ correct }) => correct);
});

const visibleReactionTimes = computed<ReactionTime[]>(() =>
  reactionTimes.value.slice(0, MAX_ENTRIES),
);

const hiddenCount = computed<number>(
  () => reactionTimes.value.length - visibleReactionTimes.value.length,
);
</script>

<style scoped>
/* The cast window is often only a few hundred pixels wide, so the ranking fills
   the available width and all sizes scale with it. */
.reaction-column {
  width: min(100%, 40rem);
}

.title {
  font-size: clamp(1.1rem, 5vw, 2.25rem);
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.5em;
}

.entry {
  font-size: clamp(0.9rem, 3.5vw, 1.5rem);
  line-height: 1.6;
}

.rank {
  min-width: 2em;
  opacity: 0.6;
}

.more {
  font-size: clamp(0.8rem, 2.5vw, 1.1rem);
  opacity: 0.6;
  margin-top: 0.5em;
}

.entry-move,
.entry-enter-active,
.entry-leave-active {
  transition: all 0.5s ease;
}

.entry-enter-from,
.entry-leave-to {
  opacity: 0;
}

.entry-leave-active {
  position: absolute;
}
</style>
