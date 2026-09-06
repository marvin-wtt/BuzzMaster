<template>
  <div class="col-grow column justify-around">
    <transition-group name="bounce">
      <cross-check
        v-if="props.symbol === 'check' || props.symbol === 'cross'"
        key="cross-check"
        :style="{ width: symbolWidth + '%' }"
        class="check-cross"
        :symbol="props.symbol"
      />
      <q-icon
        v-else-if="props.symbol === 'timer'"
        key="timer"
        name="timer"
        color="warning"
        :style="{ fontSize: '12vh', marginTop: '40px' }"
        class="check-cross q-mx-auto block"
      />

      <div
        v-if="props.showResult"
        key="result"
        class="q-gutter-lg points-info"
      >
        <div
          class="text-h2 font-bold text-center points"
          :class="pointsClass"
        >
          {{ n(props.points, { signDisplay: 'exceptZero' }) }}

          <slot />
        </div>

        <div class="row justify-center items-start q-gutter-x-md">
          <div
            v-for="button in props.buttons"
            :key="button"
            class="column items-center q-gutter-y-sm"
          >
            <div
              :class="buzzerButtonBgColor[button]"
              class="result-item"
            />

            <div
              v-if="settings.castShowControllers"
              class="column text-center text-h5 q-mt-md"
            >
              <div
                v-for="controllerId in buttonControllers[button]"
                :key="controllerId"
                class="q-my-xs row items-center justify-center"
              >
                {{ castStore.controllers[controllerId] || controllerId }}
                <span v-if="settings.mode === 'fastest-bonus'" class="text-weight-light q-ml-sm" style="opacity: 0.7;">
                  ({{ elapsedTime(controllerId) }}s)
                </span>
              </div>
            </div>
          </div>
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

import { useCastStore } from 'stores/cast-store';
import type { QuizCompleteState } from 'app/common/gameState/QuizState';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';

const { n } = useI18n();
const castStore = useCastStore();

const props = defineProps<{
  showResult: boolean;
  buttons: BuzzerButton[] | undefined;
  symbol: 'check' | 'cross' | 'timer';
  points: number;
  state: QuizCompleteState;
  filterControllers?: string[];
}>();

const settings = computed<QuizSettings>(() => castStore.gameSettings.quiz);

const elapsedTime = (controllerId: string) => {
  const time = props.state.answerTimes?.[controllerId] || 0;
  return Math.max(0, settings.value.answerTime - time).toFixed(2);
};

const buttonControllers = computed<Record<BuzzerButton, string[]>>(() => {
  const map: Record<number, string[]> = {
    [BuzzerButton.RED]: [],
    [BuzzerButton.BLUE]: [],
    [BuzzerButton.ORANGE]: [],
    [BuzzerButton.GREEN]: [],
    [BuzzerButton.YELLOW]: [],
  };

  Object.entries(props.state.result).forEach(([controllerId, btn]) => {
    if (props.filterControllers && !props.filterControllers.includes(controllerId)) {
      return;
    }
    const list = map[btn as number];
    if (list) {
      list.push(controllerId);
    }
  });

  return map as unknown as Record<BuzzerButton, string[]>;
});

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

.points-info {
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

.slide-move,
.slide-enter-active,
.slide-leave-active {
  transition: all 2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-leave-active {
  position: absolute;
}

.bounce-leave-active {
  transition: opacity 1ms step-start;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
