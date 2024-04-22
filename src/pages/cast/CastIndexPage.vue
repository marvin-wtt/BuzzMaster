<template>
  <q-page padding>
    This is a placeholder

    {{ gameState }}

    {{ controllers }}
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { storeToRefs } from 'pinia';

const castStore = useCastStore();
const { controllers, gameState } = storeToRefs(castStore);
</script>

<style scoped></style>
