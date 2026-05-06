<template>
  <div class="preparing-cast column items-center justify-center full-height q-pa-xl">
    <!-- Title -->
    <div class="text-weight-bold text-white pong-title q-mb-lg">PONG</div>

    <!-- Teams -->
    <div class="teams-row row q-col-gutter-xl q-mb-xl full-width justify-center">
      <!-- Left team -->
      <div class="col-auto team-card team-left column items-center q-pa-lg">
        <div
          class="text-h4 text-weight-bold q-mb-md"
          style="color: #2196f3"
        >
          {{ t('gameMode.pong.team.left') }}
        </div>
        <div
          v-if="leftNames.length === 0"
          class="text-grey-5 text-h6"
        >
          {{ t('cast.pong.preparing.waitingForTeams') }}
        </div>
        <div
          v-for="name in leftNames"
          :key="name"
          class="controller-name text-h5 text-white q-mb-xs"
        >
          {{ name }}
        </div>
      </div>

      <!-- VS divider -->
      <div class="col-auto vs-divider column items-center justify-center">
        <div class="text-h3 text-weight-bold text-grey-5">
          {{ t('cast.pong.preparing.vs') }}
        </div>
      </div>

      <!-- Right team -->
      <div class="col-auto team-card team-right column items-center q-pa-lg">
        <div
          class="text-h4 text-weight-bold q-mb-md"
          style="color: #ff9800"
        >
          {{ t('gameMode.pong.team.right') }}
        </div>
        <div
          v-if="rightNames.length === 0"
          class="text-grey-5 text-h6"
        >
          {{ t('cast.pong.preparing.waitingForTeams') }}
        </div>
        <div
          v-for="name in rightNames"
          :key="name"
          class="controller-name text-h5 text-white q-mb-xs"
        >
          {{ name }}
        </div>
      </div>
    </div>

    <!-- Controls explanation -->
    <div class="controls-section q-pa-lg">
      <div class="text-h5 text-grey-4 text-center q-mb-md">
        {{ t('cast.pong.preparing.controls.title') }}
      </div>
      <div class="row q-col-gutter-xl justify-center">
        <div class="col-auto column items-center">
          <div class="button-group row q-gutter-sm q-mb-sm">
            <q-badge
              style="background: #1976d2; font-size: 1rem; padding: 8px 14px"
              label="Blue"
            />
            <q-badge
              style="background: #e65100; font-size: 1rem; padding: 8px 14px"
              label="Orange"
            />
          </div>
          <div class="text-h6 text-white">
            {{ t('cast.pong.preparing.controls.up') }}
          </div>
        </div>
        <div class="col-auto column items-center">
          <div class="button-group row q-gutter-sm q-mb-sm">
            <q-badge
              style="background: #388e3c; font-size: 1rem; padding: 8px 14px"
              label="Green"
            />
            <q-badge
              style="background: #f9a825; font-size: 1rem; padding: 8px 14px"
              label="Yellow"
            />
          </div>
          <div class="text-h6 text-white">
            {{ t('cast.pong.preparing.controls.down') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastStore } from 'stores/cast-store';
import type { PongPreparingState } from 'app/common/gameState/PongState';

const { t } = useI18n();
const castStore = useCastStore();

const props = defineProps<{
  state: PongPreparingState;
}>();

const leftNames = computed(() =>
  props.state.left.controllerIds
    .map((id) => castStore.controllers[id] ?? id)
    .filter(Boolean),
);

const rightNames = computed(() =>
  props.state.right.controllerIds
    .map((id) => castStore.controllers[id] ?? id)
    .filter(Boolean),
);
</script>

<style scoped>
.preparing-cast {
  min-height: 100vh;
  background: #0a0a1a;
}

.pong-title {
  font-size: clamp(3rem, 10vw, 7rem);
  letter-spacing: 0.15em;
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.3);
}

.team-card {
  min-width: 200px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.team-left {
  border-color: rgba(33, 150, 243, 0.3);
  background: rgba(33, 150, 243, 0.06);
}

.team-right {
  border-color: rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.06);
}

.vs-divider {
  min-height: 120px;
}

.controls-section {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  min-width: 400px;
}

.controller-name {
  padding: 4px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
}
</style>
