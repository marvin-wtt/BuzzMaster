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
    const s = controllers.value
      .map((controller) => {
        return {
          id: controller.id,
          name: controller.name,
          value: points.value[controller.id] ?? 0,
          position: 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    s.forEach((item, index) => {
      if (index === 0) {
        item.position = 1;
        return;
      }

      const prev = s[index - 1];
      if (item.value === prev.value) {
        item.position = prev.position;
        return;
      }

      item.position = index + 1;
    });

    return s;
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
