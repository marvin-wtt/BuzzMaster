<template>
  <div class="bar-chart-container col-grow row justify-center q-pb-sm">
    <div class="column justify-between reverse q-py-md text-grey">
      <div>0 %</div>
      <div>25 %</div>
      <div>50 %</div>
      <div>75 %</div>
      <div>100 %</div>
    </div>
    <quiz-result-bar
      v-for="button in resultOptions"
      :key="button"
      :button="button"
      :total="buttonOccurrences[button]"
      :percentage="buttonPercentage[button]"
      :animated="props.animated"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useGameSettingsStore } from 'stores/game-settings-store';
import QuizResultBar from 'components/gameModes/quiz/QuizResultBar.vue';

const { quizSettings } = useGameSettingsStore();

interface ControllerLike {
  id: string;
  name: string;
}

const props = defineProps<{
  controllersByButton: Record<BuzzerButton, ControllerLike[] | undefined>;
  animated?: boolean;
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

const totalAnswers = computed<number>(() => {
  return Object.values(props.controllersByButton).flat().length;
});

const buttonPercentage = computed<BuzzerMap>(() => {
  const total = totalAnswers.value;
  const buttonPercentage: Record<BuzzerButton, number> = {} as BuzzerMap;
  Object.keys(BuzzerButton).map((value) => {
    const button = BuzzerButton[value as keyof typeof BuzzerButton];
    const val = (buttonOccurrences.value[button] / total) * 100;
    buttonPercentage[button] = Math.round(val * 10) / 10;
  });

  return buttonPercentage;
});
</script>

<style scoped>
.bar-chart-container {
  transition: height 10s;
}
</style>
