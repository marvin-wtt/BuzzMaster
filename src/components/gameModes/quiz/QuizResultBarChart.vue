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
      <div class="q-pb-sm">{{ buttonPercentage[button] }} %</div>

      <div class="col-grow column justify-end">
        <div
          class="bar text-center"
          :class="buzzerButtonBgColor[button]"
          :style="{
            height: `${barHeightPercentages[button]}%`,
          }"
        />
      </div>
      <div>
        {{ buttonOccurrences[button] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useBuzzer } from 'src/plugins/buzzer';

const { controllers } = useBuzzer();
const { quizSettings } = useGameSettingsStore();

interface ControllerLike {
  id: string;
  name: string;
}

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
  border-radius: 5px;
}

.bar-chart-container {
  transition: height 10s;
}
</style>
