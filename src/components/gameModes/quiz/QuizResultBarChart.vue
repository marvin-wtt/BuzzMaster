<template>
  <div class="bar-chart-container col-grow row justify-center q-pb-sm">
    <div class="column justify-between reverse q-py-md text-grey">
      <div>0 %</div>
      <div>25 %</div>
      <div>50 %</div>
      <div>75 %</div>
      <div>100 %</div>
    </div>
    <div
      v-for="button in resultOptions"
      :key="button"
      class="column justify-between no-wrap text-center"
    >
      <div
        class="q-pb-sm bar-value"
        :style="animationDurationStyle(button)"
      >
        {{ buttonPercentage[button] }} %
      </div>

      <div class="col-grow column justify-end">
        <div
          class="bar text-center"
          :style="{
            height: `${barHeightPercentages[button]}%`,
          }"
        >
          <div
            class="inner"
            :class="buzzerButtonBgColor[button]"
            :style="animationDurationStyle(button)"
          />
        </div>
      </div>
      <div
        class="bar-value"
        :style="animationDurationStyle(button)"
      >
        {{ buttonOccurrences[button] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, StyleValue } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useBuzzer } from 'src/plugins/buzzer';

const { controllers } = useBuzzer();
const { quizSettings } = useGameSettingsStore();

interface ControllerLike {
  id: string;
  name: string;
}

const maxAnimationDuration = 2;

const props = defineProps<{
  controllersByButton: Record<BuzzerButton, ControllerLike[] | undefined>;
}>();

const resultOptions = computed<BuzzerButton[]>(() => {
  // Red button as equivalent for not pressed
  const options =
    buttonOccurrences.value[BuzzerButton.RED] === 0
      ? quizSettings.activeButtons
      : [...quizSettings.activeButtons, BuzzerButton.RED];

  return options.sort();
});

type BuzzerMap = Record<BuzzerButton, number>;

const buttonOccurrences = computed<BuzzerMap>(() => {
  return {
    [BuzzerButton.BLUE]:
      props.controllersByButton[BuzzerButton.BLUE]?.length ?? 0,
    [BuzzerButton.ORANGE]:
      props.controllersByButton[BuzzerButton.ORANGE]?.length ?? 0,
    [BuzzerButton.GREEN]:
      props.controllersByButton[BuzzerButton.GREEN]?.length ?? 0,
    [BuzzerButton.YELLOW]:
      props.controllersByButton[BuzzerButton.YELLOW]?.length ?? 0,
    [BuzzerButton.RED]:
      props.controllersByButton[BuzzerButton.RED]?.length ?? 0,
  };
});

const buttonPercentage = computed<BuzzerMap>(() => {
  const total = controllers.value.length;
  const buttonPercentage: Record<BuzzerButton, number> = {} as BuzzerMap;
  Object.keys(BuzzerButton).map((value) => {
    const button = BuzzerButton[value as keyof typeof BuzzerButton];
    const val = (buttonOccurrences.value[button] / total) * 100;
    buttonPercentage[button] = Math.round(val * 10) / 10;
  });

  return buttonPercentage;
});

const barHeightPercentages = computed<BuzzerMap>(() => {
  const total = controllers.value.length;
  const buttonPercentage: Record<BuzzerButton, number> = {} as BuzzerMap;
  Object.keys(BuzzerButton).map((value) => {
    const button = BuzzerButton[value as keyof typeof BuzzerButton];
    const oVal = buttonOccurrences.value[button];
    const val = oVal === 0 ? 0.01 : oVal;
    buttonPercentage[button] = (val / total) * 100;
  });

  return buttonPercentage;
});

function animationTime(button: BuzzerButton): number {
  return (barHeightPercentages.value[button] / 100) * maxAnimationDuration;
}

function animationDurationStyle(button: BuzzerButton): StyleValue {
  const duration = animationTime(button);

  return {
    animationDuration: `${duration}s`,
  };
}

const buzzerButtonBgColor = {
  [BuzzerButton.BLUE]: 'bg-blue',
  [BuzzerButton.ORANGE]: 'bg-orange',
  [BuzzerButton.GREEN]: 'bg-green',
  [BuzzerButton.YELLOW]: 'bg-yellow',
  [BuzzerButton.RED]: 'bg-grey',
};
</script>

<style scoped>
.bar {
  width: 50px;
  margin: 0 10px;
  position: relative;
}

.bar .inner {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  animation-name: growBar;
  animation-timing-function: linear;
  position: absolute;
  bottom: 0;
}

.bar-value {
  opacity: 1;
  animation-name: fadeIn;
  animation-timing-function: linear;
}

.bar-chart-container {
  transition: height 10s;
}

@keyframes growBar {
  from {
    height: 0;
  }

  to {
    height: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  0% {
    opacity: 0;
  }

  99% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
