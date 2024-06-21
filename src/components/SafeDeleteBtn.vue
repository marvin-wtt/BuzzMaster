<template>
  <template v-if="selected">
    <q-btn
      v-bind="$attrs"
      icon="done"
      label=""
      @click="onConfirm"
    />
  </template>
  <template v-else>
    <q-btn
      v-bind="$attrs"
      @click="onAction"
    />
  </template>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const selected = ref<boolean>(false);
let timeout: NodeJS.Timeout | undefined;

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const onAction = () => {
  selected.value = true;

  timeout = setTimeout(() => {
    selected.value = false;
  }, 1000);
};

const onConfirm = () => {
  emit('click');
  clearTimeout(timeout);
  selected.value = false;
};
</script>

<style scoped></style>
