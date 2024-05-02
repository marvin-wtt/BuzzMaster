<template>
  {{ controllers[props.state.controller] }}
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCastStore } from 'stores/cast-store';
import { BuzzerAnsweringState } from 'app/common/gameState/BuzzerState';

const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const props = defineProps<{
  state: BuzzerAnsweringState;
}>();
</script>

<style scoped></style>
