import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppSettingsStore = defineStore('appSettings', () => {
  const muted = ref<boolean>(false);

  return {
    muted,
  };
});
