<template>
  <q-page class="row items-center justify-evenly">
    <router-link to="devices"> Devices </router-link>

    <q-list>
      <q-item v-for="dongle in dongles" :key="dongle.name">
        {{ dongle.name }}
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useBuzzer } from 'src/plugins/buzzer';

const { dongles } = useBuzzer();
</script>
