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

const props = defineProps<{
  answers: Record<string, BuzzerButton>;
  totalAnswers: number;
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
  const result: Record<BuzzerButton, number> = {
    [BuzzerButton.RED]: 0,
    [BuzzerButton.BLUE]: 0,
    [BuzzerButton.ORANGE]: 0,
    [BuzzerButton.GREEN]: 0,
    [BuzzerButton.YELLOW]: 0,
  };

  return Object.values(props.answers).reduce((acc, button) => {
    acc[button] += 1;
    return acc;
  }, result);
});

const buttonPercentage = computed<BuzzerMap>(() => {
  const buttonPercentage: Record<BuzzerButton, number> = {} as BuzzerMap;
  Object.keys(BuzzerButton).map((value) => {
    const button = BuzzerButton[value as keyof typeof BuzzerButton];
    const val = (buttonOccurrences.value[button] / props.totalAnswers) * 100;
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
