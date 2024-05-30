<template>
  {{ formattedTime }}
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  time: number | undefined;
}>();

const formattedTime = computed<string>(() => {
  if (props.time === undefined) {
    return t('gameMode.stopwatch.disqualified');
  }

  const date = new Date(props.time * 1000);

  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds())
    .padStart(3, '0')
    .slice(0, 2);

  return `${minutes}:${seconds}.${milliseconds}`;
});
</script>

<style scoped></style>
