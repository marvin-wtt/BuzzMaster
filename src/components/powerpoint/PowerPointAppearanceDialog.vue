<template>
  <q-dialog
    v-model="open"
    :maximized="maximized"
    data-testid="pp-appearance-dialog"
  >
    <q-card class="pp-dialog-card column no-wrap">
      <q-card-section class="row items-center q-pb-none">
        <span class="text-subtitle1">
          {{ t('powerpoint.appearance.title') }}
        </span>
        <q-space />
        <q-btn
          v-close-popup
          flat
          dense
          round
          icon="close"
          :aria-label="t('powerpoint.config.close')"
          data-testid="pp-appearance-close"
        />
      </q-card-section>

      <q-card-section class="col scroll">
        <PowerPointAppearance v-model="appearance" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div
          class="pp-instance"
          :title="instanceId"
        >
          {{ instanceId.slice(0, 8) }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import {
  DEFAULT_APPEARANCE,
  type Appearance,
} from '@/../common/powerpoint/PowerPointConfig';
import PowerPointAppearance from '@/components/powerpoint/PowerPointAppearance.vue';

/**
 * Appearance settings for one embedded element, in a dialog.
 *
 * Only appearance lives here. Game mode and its settings stay inline, because
 * those are what the presenter changes while building a slide — appearance is
 * set once and then left alone, so it does not need to occupy the element.
 *
 * The instance id is shown here too rather than on the element itself: useful
 * when debugging which element is which, but not worth permanent space.
 */
defineProps<{
  instanceId: string;
}>();

const open = defineModel<boolean>({ required: true });
const appearanceModel = defineModel<Appearance | undefined>('appearance');

const emit = defineEmits<{ saved: [] }>();

const { t } = useI18n();
const quasar = useQuasar();

/**
 * Maximise in a small frame.
 *
 * An add-in element is routinely narrower than a normal dialog, so a centred
 * card would be clipped by its own container.
 */
const maximized = computed(
  () => quasar.screen.lt.sm || window.innerWidth < 600,
);

const appearance = computed<Appearance>({
  get: () => appearanceModel.value ?? DEFAULT_APPEARANCE,
  set: (value) => {
    appearanceModel.value = value;
    emit('saved');
  },
});
</script>

<style scoped>
.pp-dialog-card {
  width: 100%;
  max-width: 22rem;
  max-height: 100%;
}

.pp-instance {
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
  opacity: 0.35;
  text-align: right;
}
</style>
