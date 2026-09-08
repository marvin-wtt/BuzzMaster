import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';

export const useCastWindowStore = defineStore('castWindow', () => {
  const open = ref<boolean>(false);

  function initialize() {
    if (window.castAPI === undefined) {
      return;
    }

    window.castAPI.onCastWindowUpdate(setOpen);
    window.castAPI
      .isOpen()
      .then(setOpen)
      .catch((reason: unknown) => {
        console.error(reason);
      });
  }

  function setOpen(value: boolean) {
    open.value = value;
  }

  function toggle() {
    window.castAPI?.toggle();
  }

  return {
    open,

    initialize,
    setOpen,
    toggle,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCastWindowStore, import.meta.hot));
}
