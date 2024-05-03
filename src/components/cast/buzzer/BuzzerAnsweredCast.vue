<template>
  <div class="column justify-around">
    <transition-group name="slide">
      <cross-check
        key="cross-check"
        class="check-cross"
        :style="{ width: checkWidth + '%' }"
        :mode="symbol"
      />
      <div
        v-if="showScores"
        key="check"
        class="score-info column"
      >
        <div class="text-h4 text-center">
          {{ controllers[props.state.controller] }}
        </div>
        <div class="text-h3 font-bold text-right">
          {{ props.state.points }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import { BuzzerAnsweredState } from 'app/common/gameState/BuzzerState';
import CrossCheck from 'components/CrossCheck.vue';
import { computed, ref } from 'vue';
import { useCastStore } from 'stores/cast-store';
import { storeToRefs } from 'pinia';

const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const props = defineProps<{
  state: BuzzerAnsweredState;
}>();

const showScores = ref<boolean>(false);
const checkWidth = ref<number>(100);

const symbol = computed<'check' | 'cross'>(() => {
  return props.state.correct ? 'check' : 'cross';
});

setTimeout(() => {
  showScores.value = true;
  checkWidth.value = 50;
}, 2000);
</script>

<style scoped>
.check-cross,
.score-info {
  transition:
    width 0.5s ease-in-out,
    transform 0.5s ease-in-out;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease-in-out;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(100%);
}

.slide-leave-active {
  position: absolute;
}
</style>
