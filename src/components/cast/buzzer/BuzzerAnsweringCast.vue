<template>
  <div class="column col-12 justify-center text-center">
    <circle-timer
      :time="props.state.time"
      :max="settings.answerTime"
    >
      <text-dynamic :name="controllers[props.state.controller]">
        <timer-animated
          v-if="settings.answerTime > 0"
          :time="props.state.time"
          animated
        />
      </text-dynamic>
    </circle-timer>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCastStore } from 'stores/cast-store';
import { BuzzerAnsweringState } from 'app/common/gameState/BuzzerState';
import CircleTimer from 'components/CircleTimer.vue';
import TimerAnimated from 'components/TimerAnimated.vue';
import TextDynamic from 'components/TextDynamic.vue';
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { computed } from 'vue';

const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const settings = computed<BuzzerSettings>(() => {
  return castStore.gameSettings.buzzer;
});

const props = defineProps<{
  state: BuzzerAnsweringState;
}>();
</script>

<style scoped></style>
