import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';

export type Score = {
  id: string;
  name: string;
  value: number;
  position: number;
};

export const useScoreboardStore = defineStore('scoreboard', () => {
  const { controllers } = useBuzzer();

  const points = ref<Record<string, number>>({});

  const scores = computed<Score[]>(() => {
    const scores = controllers.value
      .map((controller) => ({
        id: controller.id,
        name: controller.name,
        value: points.value[controller.id] ?? 0,
        position: 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Set the position for each element
    scores.forEach((score, index) => {
      // Same position for entries with same value
      score.position =
        index === 0 || score.value !== scores[index - 1].value
          ? index + 1
          : scores[index - 1].position;
    });

    return scores;
  });

  const addPoints = (controllerId: string, p: number) => {
    points.value[controllerId] ??= 0;
    points.value[controllerId] += p;
  };

  const updatePoints = (controllerId: string, p: number) => {
    points.value[controllerId] = p;
  };

  const resetPoints = () => {
    points.value = {};
  };

  return {
    scores,
    addPoints,
    updatePoints,
    resetPoints,
  };
});
