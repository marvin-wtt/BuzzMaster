<template>
  <div class="col-grow column justify-around">
    <transition-group name="slide">
      <cross-check
        key="cross-check"
        :style="{ width: symbolWidth + '%' }"
        class="check-cross"
        :mode="props.symbol"
      />

      <div
        v-if="props.showResult"
        key="result"
        class="q-gutter-lg score-info"
      >
        <div
          class="text-h2 font-bold text-center points"
          :class="pointsClass"
        >
          {{ n(props.points, { signDisplay: 'exceptZero' }) }}

          <slot />
        </div>

        <div class="row justify-center q-gutter-x-md">
          <div
            v-for="button in props.buttons"
            :key="button"
            :class="buzzerButtonBgColor[button]"
            class="result-item"
          />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import CrossCheck from 'components/CrossCheck.vue';
import { computed } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';

const { n } = useI18n();

const props = defineProps<{
  showResult: boolean;
  buttons: BuzzerButton[] | undefined;
  symbol: 'check' | 'cross';
  points: number;
}>();

const symbolWidth = computed<number>(() => {
  return props.showResult ? 25 : 50;
});

const pointsClass = computed<string>(() => {
  if (props.points > 0) {
    return 'text-green';
  }

  if (props.points < 0) {
    return 'text-red';
  }

  return 'text-blue';
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
.check-cross {
  transition:
    width 0.5s ease-in-out,
    transform 0.5s ease-in-out;
}

.score-info {
  transition-delay: 0.5s;
  transition:
    width 0.5s ease-in-out,
    transform 0.5s ease-in-out;
}

.result-item {
  width: 50px;
  aspect-ratio: 1;
  border-radius: 50px;
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
