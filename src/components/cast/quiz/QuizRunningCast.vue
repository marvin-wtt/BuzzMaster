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
  </div>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { QuizRunningState } from 'app/common/gameState/QuizState';
import CircleTimer from 'components/CircleTimer.vue';
import TimerAnimated from 'components/TimerAnimated.vue';
import { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { computed } from 'vue';

const castStore = useCastStore();

const settings = computed<QuizSettings>(() => {
  return castStore.gameSettings.quiz;
});

const props = defineProps<{
  state: QuizRunningState;
}>();
</script>

<style scoped></style>
