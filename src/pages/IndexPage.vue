<template>
  <q-page class="column items-center justify-evenly">
    <a class="text-h3">
      {{ t('app_name') }}
    </a>

    <q-img
      src="logo.png"
      alt="logo"
      style="width: 250px"
    />

    <div class="column q-gutter-lg">
      <q-btn
        :label="t('action.start')"
        icon="play_arrow"
        to="questions"
        color="primary"
        rounded
      />

      <q-btn
        :label="t('action.devices')"
        icon="sports_esports"
        to="devices"
        color="primary"
        rounded
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
