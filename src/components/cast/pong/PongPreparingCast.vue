<template>
  <div class="preparing-cast column items-center justify-center q-pa-lg">
    <!-- Title -->
    <div class="pong-title text-weight-bold q-mb-lg">PONG</div>

    <!-- Teams -->
    <div class="teams-row row justify-center q-col-gutter-lg q-mb-lg">
      <!-- Left team -->
      <div class="col-auto team-card team-left column items-center q-pa-md">
        <div
          class="text-h5 text-weight-bold q-mb-sm"
          style="color: #2196f3"
        >
          {{ t('gameMode.pong.team.left') }}
        </div>
        <div
          v-if="leftNames.length === 0"
          class="text-subtitle1 text-grey-5"
        >
          {{ t('cast.pong.preparing.waitingForTeams') }}
        </div>
        <div
          v-for="name in leftNames"
          :key="name"
          class="controller-name text-subtitle1 q-mb-xs"
        >
          {{ name }}
        </div>
      </div>

      <!-- VS divider -->
      <div class="col-auto vs-divider column items-center justify-center q-px-sm">
        <div class="text-h4 text-weight-bold text-grey-5">
          {{ t('cast.pong.preparing.vs') }}
        </div>
      </div>

      <!-- Right team -->
      <div class="col-auto team-card team-right column items-center q-pa-md">
        <div
          class="text-h5 text-weight-bold q-mb-sm"
          style="color: #ff9800"
        >
          {{ t('gameMode.pong.team.right') }}
        </div>
        <div
          v-if="rightNames.length === 0"
          class="text-subtitle1 text-grey-5"
        >
          {{ t('cast.pong.preparing.waitingForTeams') }}
        </div>
        <div
          v-for="name in rightNames"
          :key="name"
          class="controller-name text-subtitle1 q-mb-xs"
        >
          {{ name }}
        </div>
      </div>
    </div>

    <!-- Controls explanation -->
    <div class="controls-section q-pa-md">
      <div class="text-subtitle1 text-grey-5 text-center q-mb-sm">
        {{ t('cast.pong.preparing.controls.title') }}
      </div>
      <div class="row justify-center q-col-gutter-md">
        <div class="col-auto column items-center">
          <div class="row q-gutter-xs q-mb-xs">
            <q-badge
              class="btn-badge"
              style="background: #1976d2"
              label="Blue"
            />
            <q-badge
              class="btn-badge"
              style="background: #e65100"
              label="Orange"
            />
          </div>
          <div class="text-body1">{{ t('cast.pong.preparing.controls.up') }}</div>
        </div>
        <div class="col-auto column items-center">
          <div class="row q-gutter-xs q-mb-xs">
            <q-badge
              class="btn-badge"
              style="background: #388e3c"
              label="Green"
            />
            <q-badge
              class="btn-badge"
              style="background: #f9a825; color: #000"
              label="Yellow"
            />
          </div>
          <div class="text-body1">{{ t('cast.pong.preparing.controls.down') }}</div>
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
/* No background — controlled by CastLayout (transparent / dark / light) */
.preparing-cast {
  height: 100%;
  min-height: 0;
}

.pong-title {
  font-size: clamp(2.5rem, 8vw, 6rem);
  letter-spacing: 0.15em;
  text-shadow: 0 0 30px rgba(128, 128, 255, 0.4);
}

.team-card {
  min-width: 140px;
  border-radius: 12px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: rgba(128, 128, 128, 0.06);
}

.team-left {
  border-color: rgba(33, 150, 243, 0.35);
  background: rgba(33, 150, 243, 0.07);
}

.team-right {
  border-color: rgba(255, 152, 0, 0.35);
  background: rgba(255, 152, 0, 0.07);
}

.vs-divider {
  min-height: 80px;
}

.controls-section {
  border-radius: 12px;
  border: 1px solid rgba(128, 128, 128, 0.15);
  background: rgba(128, 128, 128, 0.04);
  max-width: 100%;
}

.controller-name {
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(128, 128, 128, 0.1);
}

.btn-badge {
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 4px;
}
</style>
