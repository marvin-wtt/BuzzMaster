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
        v-if="showPoints"
        key="check"
        class="score-info column"
      >
        <div
          class="text-h3 text-center q-py-md"
          style="word-break: break-all"
        >
          {{ controllers[props.state.controller] }}
        </div>
        <q-separator />
        <div
          class="text-h2 font-bold text-center points q-py-md"
          :class="pointsClass"
        >
          {{ n(props.state.points, { signDisplay: 'exceptZero' }) }}
          {{ t('cast.buzzer.answered.points') }}
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
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();
const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const props = defineProps<{
  state: BuzzerAnsweredState;
}>();

const showPoints = ref<boolean>(false);
const checkWidth = ref<number>(100);

const pointsClass = computed<string>(() => {
  if (props.state.points > 0) {
    return 'text-green';
  }

  if (props.state.points < 0) {
    return 'text-red';
  }

  return 'text-blue';
});

const symbol = computed<'check' | 'cross'>(() => {
  return props.state.correct ? 'check' : 'cross';
});

setTimeout(() => {
  showPoints.value = true;
  checkWidth.value = 75;
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
