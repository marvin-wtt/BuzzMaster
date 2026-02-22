<template>
  <q-page padding>
    <!-- Empty page -->
  </q-page>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

onMounted(() => {
  window.castAPI.ready();
});
</script>

<style scoped></style>
