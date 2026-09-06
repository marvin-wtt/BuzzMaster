<template>
  <div class="column col-12 justify-center text-center">
    <circle-timer
      :time="props.state.time"
      :max="settings.answerTime"
    >
      <timer-animated
        :time="props.state.time"
        class="text-h1"
        animated
      />
    </circle-timer>
    <div
      v-if="props.state.mode === 'ordering'"
      class="text-h4 q-mt-lg"
    >
      {{ t('cast.quiz.running.ordering', settings.activeButtons.length) }}
      <div class="text-h5 q-mt-sm">
        {{ t('cast.quiz.running.redResets') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import type {
  QuizOrderingRunningState,
  QuizRunningState,
} from 'app/common/gameState/QuizState';
import CircleTimer from 'components/CircleTimer.vue';
import TimerAnimated from 'components/TimerAnimated.vue';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const castStore = useCastStore();
const { t } = useI18n();

const settings = computed<QuizSettings>(() => {
  return castStore.gameSettings.quiz;
});

const props = defineProps<{
  state: QuizRunningState | QuizOrderingRunningState;
}>();
</script>

<style scoped></style>
