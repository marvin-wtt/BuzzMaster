<template>
  <div
    ref="root"
    class="pp-root"
    :style="rootStyle"
  >
    <!-- Paint pump. See plan section 21.3: PowerPoint does not repaint an add-in
         in Slide Show until its content changes, so a static screen renders
         blank. This element is mutated every frame for as long as the add-in is
         mounted. It is not decorative and it is not dead code — removing it
         makes every static state invisible on a slide. -->
    <div
      ref="paintPump"
      class="pp-paint-pump"
      data-testid="pp-paint-pump"
      aria-hidden="true"
    />

    <div
      v-if="status === 'loading'"
      class="pp-centre pp-muted"
      data-testid="pp-loading"
    >
      {{ t('powerpoint.status.loading') }}
    </div>

    <div
      v-else-if="status !== 'ready'"
      class="pp-centre"
      data-testid="pp-error"
    >
      <div class="pp-error-title">{{ t('powerpoint.status.unavailable') }}</div>
      <div class="pp-muted">{{ error }}</div>
    </div>

    <!-- Edit mode only, deliberately. In Slide Show this element is facing an
         audience, and an authoring warning is not theirs to see or fix - the
         author is the one who can drag the handle. -->
    <div
      v-if="status === 'ready' && view === 'edit' && tooNarrow"
      class="pp-warning"
      data-testid="pp-too-narrow"
    >
      {{ t('powerpoint.config.tooNarrow', { min: CAST_MIN_WIDTH }) }}
    </div>

    <div
      v-if="status === 'ready'"
      class="pp-content"
    >
      <PowerPointConfigurationView
        v-if="view === 'edit'"
        v-model:preset="preset"
        v-model:appearance="appearanceModel"
        :instance-id="config?.instanceId ?? ''"
        data-testid="pp-configuration"
      />

      <PowerPointPresentationView
        v-else
        :preset="preset"
        :instance-id="config?.instanceId"
        data-testid="pp-presentation"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  useTemplateRef,
  watchEffect,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useOffice } from '@/composables/office';
import { useElementWidth } from '@/composables/elementWidth';
import { CAST_MIN_WIDTH } from '@/../common/castWindow';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';
import {
  DEFAULT_APPEARANCE,
  withAppearance,
  withPreset,
  type Appearance,
} from '@/../common/powerpoint/PowerPointConfig';
import { useQuasar } from 'quasar';
import PowerPointConfigurationView from '@/components/powerpoint/PowerPointConfigurationView.vue';
import PowerPointPresentationView from '@/components/powerpoint/PowerPointPresentationView.vue';

defineOptions({
  name: 'PowerPointPage',
});

const { t } = useI18n();
const quasar = useQuasar();
const { status, view, config, error, save } = useOffice();

const appearance = computed<Appearance>(
  () => config.value?.appearance ?? DEFAULT_APPEARANCE,
);

/**
 * Drive Quasar's dark mode from the element's own setting.
 *
 * The cast pages style themselves through Quasar's dark mode, so this is what
 * makes them match the slide rather than the operating system. Without it the
 * add-in follows `dark: 'auto'` from quasar.config and is dark on most machines
 * regardless of the deck.
 *
 * Safe to set globally here: the add-in is its own browser context, separate
 * from the app and cast windows.
 */
watchEffect(() => {
  quasar.dark.set(appearance.value.theme === 'dark');
});

const resolvedBackground = computed(() => {
  if (appearance.value.background) {
    return appearance.value.background;
  }
  return appearance.value.theme === 'dark' ? '#10131a' : '#ffffff';
});

const rootStyle = computed(() => ({
  '--pp-bg': resolvedBackground.value,
  '--pp-fg': appearance.value.theme === 'dark' ? '#e8ecf4' : '#1d2430',
  // The paint pump must be genuinely painted to force layout (§21.3), so it
  // takes the background colour and disappears against it.
  '--pp-pump': resolvedBackground.value,
}));

const preset = computed<GamePreset | undefined>({
  get: () => config.value?.preset,
  set: (value) => {
    if (!config.value) {
      return;
    }
    // `withPreset` rather than rebuilding the object: everything else on the
    // config - appearance in particular - must survive a game mode change.
    config.value = withPreset(config.value, value);
    save();
  },
});

const appearanceModel = computed<Appearance | undefined>({
  get: () => config.value?.appearance,
  set: (value) => {
    if (!config.value || !value) {
      return;
    }
    config.value = withAppearance(config.value, value);
    save();
  },
});

const root = useTemplateRef<HTMLElement>('root');
const elementWidth = useElementWidth(root);

/**
 * Whether the element is narrower than the cast is designed for.
 *
 * The cast window cannot be dragged below `CAST_MIN_WIDTH`; a slide element can
 * be made any size at all, so the author gets told rather than stopped.
 */
const tooNarrow = computed(
  () => elementWidth.value !== undefined && elementWidth.value < CAST_MIN_WIDTH,
);

const paintPump = useTemplateRef<HTMLElement>('paintPump');
let frame: number | undefined;

onMounted(() => {
  let phase = 0;

  const pump = () => {
    // Must be a LAYOUT change on a genuinely painted element.
    //
    // A `transform` (or opacity) tweak is not enough: Chromium promotes such an
    // element to its own layer and only re-composites it, which does not make
    // PowerPoint repaint the add-in surface. A sub-pixel translate can also
    // quantise away to no change at all. Both were tried and left the element
    // blank in Slide Show until clicked.
    //
    // Changing `left` forces layout -> paint -> composite every frame, which is
    // exactly what the Phase 0 probe did when it stayed visible. The strip is
    // painted in the page background colour rather than made transparent, so it
    // is genuinely drawn while remaining invisible.
    phase = (phase + 1) % 4;
    if (paintPump.value) {
      paintPump.value.style.left = `${-phase}px`;
    }
    frame = requestAnimationFrame(pump);
  };

  frame = requestAnimationFrame(pump);
});

onBeforeUnmount(() => {
  if (frame !== undefined) {
    cancelAnimationFrame(frame);
  }
});
</script>

<style scoped>
.pp-root {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--pp-bg, #10131a);
  color: var(--pp-fg, #e8ecf4);
}

.pp-paint-pump {
  /* Painted in the page background colour, not made transparent: it must be a
     real paint operation to force PowerPoint to repaint the surface, while
     staying invisible to the audience. Sized for a meaningful paint area rather
     than a single pixel. */
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--pp-pump, var(--pp-bg, #10131a));
  pointer-events: none;
}

/* `min-height: 0` so the content can shrink instead of pushing the warning off
   the top of a short element. */
.pp-content {
  flex: 1;
  min-height: 0;
}

.pp-warning {
  flex: none;
  margin: 0.4rem 0.6rem 0;
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  background: rgb(255 210 92 / 18%);
  color: var(--pp-fg, #e8ecf4);
  font-size: 0.7rem;
  line-height: 1.35;
}

.pp-centre {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  padding: 1rem;
  text-align: center;
}

.pp-error-title {
  font-weight: 700;
}

.pp-muted {
  opacity: 0.7;
}
</style>
