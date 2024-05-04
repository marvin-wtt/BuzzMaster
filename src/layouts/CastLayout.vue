<template>
  <q-layout
    @focus="mouseEnter"
    @blur="mouseLeave"
    view="hHh Lpr fFf"
    class="layout"
  >
    <q-header
      v-if="showAppBar"
      class="bg-grey"
      elevated
    >
      <q-bar class="q-electron-drag"> Cast </q-bar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

const castStore = useCastStore();
const quasar = useQuasar();

quasar.dark.set(false);

window.castAPI.onGameStateUpdate(castStore.updateGameState);
window.castAPI.onGameSettingsUpdate(castStore.updateGameSettings);
window.castAPI.onLocaleUpdate(castStore.updateLocale);
window.castAPI.onControllerUpdate(castStore.updateControllers);

const showAppBar = ref<boolean>(false);
function mouseEnter() {
  showAppBar.value = true;
}

function mouseLeave() {
  showAppBar.value = false;
}
</script>

<style scoped>
.layout:focus {
  box-shadow: inset 0 0 0 3px gray;
}
</style>
