import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';

export type LeaderboardEntry = {
  id: string;
  name: string;
  value: number;
  position: number;
};

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const { controllers } = useBuzzer();

  const points = ref<Record<string, number>>({});

  const leaderboard = computed<LeaderboardEntry[]>(() => {
    const entries = controllers.value
      .map((controller) => ({
        id: controller.id,
        name: controller.name,
        value: points.value[controller.id] ?? 0,
        position: 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Set the position for each element
    entries.forEach((entry, index) => {
      // Same position for entries with same value
      entry.position =
        index === 0 || entry.value !== entries[index - 1].value
          ? index + 1
          : entries[index - 1].position;
    });

    return entries;
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
    leaderboard,
    addPoints,
    updatePoints,
    resetPoints,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLeaderboardStore, import.meta.hot));
}
