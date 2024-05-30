<template>
  <div class="col-12 column no-wrap">
    <!-- This can be simplified... -->
    <div class="col-12 row justify-center">
      <div class="col-12 self-center text-center justify-center">
        <pulse-circle
          class="column justify-center q-col-gutter-sm text-h3"
          pulse
        >
          {{ t('cast.buzzer.running.go') }}
        </pulse-circle>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PulseCircle from 'components/PulseCircle.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped></style>
