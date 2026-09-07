<template>
  <div class="col-12 column no-wrap justify-center items-center q-pa-xl">
    <pulse-circle
      class="cast-go column justify-center items-center text-center"
      pulse
    >
      {{ t('cast.buzzer.running.go') }}
    </pulse-circle>
  </div>
</template>

<script lang="ts" setup>
import PulseCircle from 'components/PulseCircle.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.cast-go {
  width: min(52vh, 62vw);
  font-size: clamp(2rem, 9vw, 5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}
</style>
