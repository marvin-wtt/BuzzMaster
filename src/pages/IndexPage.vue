<template>
  <q-page class="column items-center justify-evenly">
    <a class="text-h3">
      {{ t('app_name') }}
    </a>

    <div class="column q-gutter-lg">
      <q-btn
        label="Start"
        icon="play_arrow"
        to="questions"
        color="primary"
        rounded
      />

      <q-btn
        label="Devices"
        icon="sports_esports"
        to="devices"
        color="primary"
        rounded
      />

      <q-btn
        color="primary"
        rounded
        @click="test"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

function test() {
  window.open('/devices/');
}
</script>
