import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import type { LeaderboardEntry } from 'app/common/gameState/LeaderboardState';

export type Leaderboard = LeaderboardEntry[];

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const { controllers } = useBuzzer();

  const controllerPoints = ref<Record<string, number>>({});

  const leaderboard = computed<LeaderboardEntry[]>(() => {
    const entries = controllers.value
      .map((controller) => ({
        id: controller.id,
        name: controller.name,
        value: controllerPoints.value[controller.id] ?? 0,
        position: 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Set the position for each element
    entries.forEach((entry, index) => {
      // Same position for entries with same value
      entry.position =
        index === 0 || entry.value !== entries[index - 1]!.value
          ? index + 1
          : entries[index - 1]!.position;
    });

    return entries;
  });

  const addPoints = (controllerId: string, points: number) => {
    controllerPoints.value[controllerId] ??= 0;
    controllerPoints.value[controllerId] += points;
  };

  const updatePoints = (controllerId: string, points: number) => {
    controllerPoints.value[controllerId] = points;
  };

  const resetPoints = () => {
    controllerPoints.value = {};
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
