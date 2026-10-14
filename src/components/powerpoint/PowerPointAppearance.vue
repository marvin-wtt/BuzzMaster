<template>
  <div class="pp-appearance">
    <q-btn-toggle
      :model-value="appearance.theme"
      :options="themeOptions"
      spread
      no-caps
      rounded
      unelevated
      dense
      toggle-color="primary"
      data-testid="pp-theme"
      @update:model-value="onThemeChange"
    />

    <q-select
      :model-value="backgroundMode"
      :options="backgroundOptions"
      :label="t('powerpoint.appearance.background')"
      emit-value
      map-options
      outlined
      dense
      rounded
      data-testid="pp-background-mode"
      @update:model-value="onBackgroundModeChange"
    />

    <div
      v-if="backgroundMode === 'custom'"
      class="pp-colour"
    >
      <q-input
        :model-value="customColour"
        :label="t('powerpoint.appearance.colour')"
        outlined
        dense
        rounded
        maxlength="9"
        :rules="[
          (v: string) =>
            isSafeColour(v) || t('powerpoint.appearance.colourInvalid'),
        ]"
        hide-bottom-space
        data-testid="pp-background-colour"
        @update:model-value="onColourChange"
      >
        <template #append>
          <q-icon
            name="colorize"
            class="cursor-pointer"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-color
                :model-value="customColour"
                format-model="hex"
                no-header-tabs
                @update:model-value="onColourChange"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  DEFAULT_APPEARANCE,
  isSafeColour,
  type Appearance,
  type ThemeMode,
} from '@/../common/powerpoint/PowerPointConfig';

/**
 * Appearance controls for one embedded element.
 *
 * Per element rather than global, because a single deck routinely mixes dark and
 * light slides and each element should match the one it sits on.
 */
const appearance = defineModel<Appearance>({
  required: true,
});

const { t } = useI18n();

type BackgroundMode = 'theme' | 'custom';

const backgroundMode = computed<BackgroundMode>(() =>
  appearance.value.background ? 'custom' : 'theme',
);

/** Seeded from the active theme, so opening the picker starts somewhere sane. */
const customColour = computed(
  () =>
    appearance.value.background ??
    (appearance.value.theme === 'dark' ? '#10131a' : '#ffffff'),
);

const themeOptions = computed(() => [
  { value: 'dark', label: t('powerpoint.appearance.dark'), icon: 'dark_mode' },
  {
    value: 'light',
    label: t('powerpoint.appearance.light'),
    icon: 'light_mode',
  },
]);

// No transparent option: PowerPoint does not render content add-ins with a
// see-through background, so it would be a setting that silently does nothing.
const backgroundOptions = computed(() => [
  { value: 'theme', label: t('powerpoint.appearance.backgroundTheme') },
  { value: 'custom', label: t('powerpoint.appearance.backgroundCustom') },
]);

/**
 * Always emit a whole new object.
 *
 * `background` is optional under `exactOptionalPropertyTypes`, so clearing it
 * means omitting the key rather than assigning undefined — and rebuilding keeps
 * the persisted shape exactly what the schema describes.
 */
function emitAppearance(theme: ThemeMode, background?: string) {
  appearance.value = background ? { theme, background } : { theme };
}

function onThemeChange(value: ThemeMode | null) {
  emitAppearance(
    value ?? DEFAULT_APPEARANCE.theme,
    appearance.value.background,
  );
}

function onBackgroundModeChange(mode: BackgroundMode) {
  if (mode === 'theme') {
    emitAppearance(appearance.value.theme);
    return;
  }
  emitAppearance(appearance.value.theme, customColour.value);
}

function onColourChange(value: string | number | null) {
  const colour = String(value ?? '');
  // Reject anything that is not a colour we recognise: this value ends up in a
  // style binding, and the schema validates it on read for the same reason.
  if (isSafeColour(colour)) {
    emitAppearance(appearance.value.theme, colour);
  }
}
</script>

<style scoped>
.pp-appearance {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pp-hint {
  font-size: 0.75rem;
  opacity: 0.6;
}
</style>
