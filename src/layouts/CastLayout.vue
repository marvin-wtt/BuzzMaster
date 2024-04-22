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

const castStore = useCastStore();

window.castAPI.onGameStateUpdate((state) => {
  castStore.updateGameState(state);
});

window.castAPI.onLocaleUpdate((locale) => {
  castStore.updateLocale(locale);
});
</script>
