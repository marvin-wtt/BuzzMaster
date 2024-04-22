<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container v-if="gameState !== undefined">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { storeToRefs } from 'pinia';

const castStore = useCastStore();
const { gameState } = storeToRefs(castStore);

window.addEventListener('message', (e) => {
  if (e.data) {
    castStore.receiveMessage(e.data);
  }
});
</script>
