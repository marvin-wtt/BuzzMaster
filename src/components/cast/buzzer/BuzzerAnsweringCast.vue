<template>
  <div class="column col-12 justify-center text-center">
    <circle-timer
      :time="state.time"
      :max="settings.answerTime"
    >
      <text-dynamic :name="controllers[state.controller]!">
        <timer-animated
          v-if="settings.answerTime > 0"
          :time="state.time"
          animated
        />
      </text-dynamic>
    </circle-timer>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCastStore } from 'stores/cast-store';
import type { BuzzerAnsweringState } from 'app/common/gameState/BuzzerState';
import CircleTimer from 'components/CircleTimer.vue';
import TimerAnimated from 'components/TimerAnimated.vue';
import TextDynamic from 'components/TextDynamic.vue';
import type { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { computed } from 'vue';

const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const settings = computed<BuzzerSettings>(() => {
  return castStore.gameSettings.buzzer;
});

const { state } = defineProps<{
  state: BuzzerAnsweringState;
}>();
</script>

<style scoped></style>
