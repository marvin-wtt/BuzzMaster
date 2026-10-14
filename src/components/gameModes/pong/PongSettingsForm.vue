<template>
  <q-form
    ref="form"
    class="column q-gutter-y-sm"
  >
    <q-input
      v-model.number="model.rounds"
      :label="t('gameMode.pong.settings.field.rounds')"
      type="number"
      outlined
      rounded
      data-testid="pong-rounds"
    />

    <q-select
      v-model="model.speed"
      :label="t('gameMode.pong.settings.field.speed')"
      :options="speedOptions"
      emit-value
      map-options
      outlined
      rounded
      data-testid="pong-speed"
    />

    <q-input
      v-model.number="model.pointsForWin"
      :label="t('gameMode.pong.settings.field.pointsForWin')"
      type="number"
      :min="0"
      outlined
      rounded
      data-testid="pong-points-for-win"
    >
      <template #prepend>
        <q-icon name="emoji_events" />
      </template>
    </q-input>
  </q-form>
</template>

<script lang="ts" setup>
import { QForm } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import type {
  PongSettings,
  PongSpeedPreset,
} from '@/../common/gameSettings/PongSettings';
import type { SettingsFormApi } from '@/components/gameModes/settingsForm';

/** Store- and dialog-independent pong settings fields. See plan §13. */
const model = defineModel<PongSettings>({ required: true });

const { t } = useI18n();

const form = ref<QForm | null>(null);

const speedOptions: { label: string; value: PongSpeedPreset }[] = [
  'slow',
  'normal',
  'fast',
  'turbo',
].map((s) => ({
  label: t(`gameMode.pong.settings.speed.${s}`),
  value: s as PongSpeedPreset,
}));

defineExpose<SettingsFormApi>({
  validate: () => form.value?.validate() ?? Promise.resolve(true),
  // Nothing to reconcile across fields for this game.
  normalize: () => undefined,
});
</script>
