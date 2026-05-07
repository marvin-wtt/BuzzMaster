<template>
  <q-page
    v-if="state"
    class="pong-cast-page column justify-center"
  >
    <pong-preparing-cast
      v-if="state.name === 'preparing'"
      :state="state"
    />
    <pong-running-cast
      v-else
      :state="state"
    />
  </q-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useCastStore } from 'stores/cast-store';
import type { PongState } from 'app/common/gameState/PongState';
import PongPreparingCast from 'components/cast/pong/PongPreparingCast.vue';
import PongRunningCast from 'components/cast/pong/PongRunningCast.vue';

const castStore = useCastStore();

const state = computed<PongState>(() => castStore.gameState as PongState);
</script>

<style scoped></style>
