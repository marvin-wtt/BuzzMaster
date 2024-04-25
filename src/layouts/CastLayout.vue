<template>
  <q-layout
    view="hHh Lpr fFf"
    class="q-electron-drag"
  >
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { useQuasar } from 'quasar';

const castStore = useCastStore();
const quasar = useQuasar();

quasar.dark.set(false);

window.castAPI.onGameStateUpdate((state) => {
  castStore.updateGameState(state);
});

window.castAPI.onLocaleUpdate((locale) => {
  castStore.updateLocale(locale);
});
</script>
