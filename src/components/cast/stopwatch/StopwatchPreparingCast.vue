<template>
  <div class="column justify-center col-11">
    <div class="text-center text-h2 q-pa-lg">
      {{ t('cast.stopwatch.preparing.title') }}
    </div>

    <div class="col-grow q-ma-md relative-position">
      <controller-logo
        class="absolute"
        red
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ControllerLogo from 'components/ControllerLogo.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped></style>
