<template>
  <q-page class="column items-center justify-evenly">
    <a class="text-h3">
      {{ t('app_name') }}
    </a>
    <q-btn
      label="Devices"
      to="devices"
      color="primary"
      rounded
    />

    <q-list>
      <q-item
        v-for="dongle in dongles"
        :key="dongle.name"
      >
        {{ dongle.name }}
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useBuzzer } from 'src/plugins/buzzer';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { dongles } = useBuzzer();
</script>
