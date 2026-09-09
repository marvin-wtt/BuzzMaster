<template>
  <div class="pp-config">
    <div class="pp-header">
      <!-- Where the instance id used to sit. Appearance is set once and then
           left alone, so it does not need to occupy the element itself. -->
      <q-btn
        flat
        dense
        round
        icon="settings"
        size="sm"
        :aria-label="t('powerpoint.appearance.title')"
        data-testid="pp-open-appearance"
        @click="appearanceOpen = true"
      >
        <q-tooltip :delay="500">
          {{ t('powerpoint.appearance.title') }}
        </q-tooltip>
      </q-btn>

      <span class="pp-title">BuzzMaster</span>

      <q-space />

      <span
        class="pp-saved"
        :class="{ 'pp-saved--visible': showSaved }"
        data-testid="pp-saved"
      >
        {{ t('powerpoint.config.saved') }}
      </span>
    </div>

    <q-select
      :model-value="game"
      :options="gameOptions"
      :label="t('powerpoint.config.gameMode')"
      data-testid="pp-game-select"
      emit-value
      map-options
      outlined
      dense
      rounded
      clearable
      @update:model-value="onGameChange"
    />

    <div
      v-if="!localPreset"
      class="pp-hint"
      data-testid="pp-no-game"
    >
      {{ t('powerpoint.config.noGame') }}
    </div>

    <div
      v-else
      class="pp-settings"
    >
      <PowerPointGameSettings
        v-model="localPreset"
        data-testid="pp-settings"
        @change="onSettingsChange"
      />
    </div>

    <PowerPointAppearanceDialog
      v-model="appearanceOpen"
      v-model:appearance="appearance"
      :instance-id="instanceId"
      @saved="markSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  PRESET_GAMES,
  type GamePreset,
  type PresetGame,
} from '@/../common/gamePreset/GamePreset';
import { defaultPresetFor } from '@/../common/gamePreset/defaults';
import type { Appearance } from '@/../common/powerpoint/PowerPointConfig';
import PowerPointGameSettings from '@/components/powerpoint/PowerPointGameSettings.vue';
import PowerPointAppearanceDialog from '@/components/powerpoint/PowerPointAppearanceDialog.vue';

defineProps<{
  instanceId: string;
}>();

const preset = defineModel<GamePreset | undefined>('preset');
const appearance = defineModel<Appearance | undefined>('appearance');

const { t } = useI18n();

const appearanceOpen = ref(false);

/**
 * Deep copy that tolerates reactive proxies.
 *
 * `structuredClone` throws `DataCloneError` on a Vue proxy, which is exactly
 * what a prop or a `ref`-wrapped object is. A preset is plain JSON by
 * construction, so a JSON round-trip is both safe and sufficient — the same
 * approach `MainLayout` already uses for cast payloads.
 */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/**
 * Local working copy.
 *
 * The forms mutate their model in place, so binding them straight to the model
 * prop would mutate the stored preset without ever going through the setter —
 * and nothing would trigger a save. Edits are applied here and pushed up on
 * change.
 */
const localPreset = ref<GamePreset | undefined>(clone(preset.value));

watch(preset, (value) => {
  // Only adopt outside changes, e.g. the config being loaded from the document
  // after Office initialises.
  if (JSON.stringify(value) !== JSON.stringify(localPreset.value)) {
    localPreset.value = clone(value);
  }
});

const game = computed<PresetGame | undefined>(() => localPreset.value?.game);

const gameOptions = computed(() =>
  PRESET_GAMES.map((value) => ({
    value,
    label: t(`gameMode.${value}.title`),
  })),
);

const showSaved = ref(false);
let savedTimer: ReturnType<typeof setTimeout> | undefined;

function markSaved() {
  showSaved.value = true;
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => {
    showSaved.value = false;
  }, 1500);
}

function onGameChange(value: PresetGame | null) {
  // Seed with the same defaults a freshly launched game uses, so a preset is
  // always complete and activatable.
  localPreset.value = value ? defaultPresetFor(value) : undefined;
  preset.value = localPreset.value;
  markSaved();
}

function onSettingsChange() {
  if (!localPreset.value) {
    return;
  }
  // Persisting is debounced upstream in `useOffice`, so this can fire per
  // keystroke without calling saveAsync each time (plan §12).
  preset.value = clone(localPreset.value);
  markSaved();
}
</script>

<style scoped>
.pp-config {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.3rem 0.9rem 0.9rem;
  height: 100%;
  overflow-y: auto;
}

.pp-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pp-title {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}

.pp-hint {
  font-size: 0.8rem;
  opacity: 0.6;
}

.pp-settings {
  flex: 1;
  min-height: 0;
}

.pp-saved {
  font-size: 0.65rem;
  opacity: 0;
  transition: opacity 150ms ease;
}

.pp-saved--visible {
  opacity: 0.6;
}
</style>
