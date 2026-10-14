<template>
  <q-form
    ref="form"
    class="column q-gutter-y-sm"
  >
    <q-toggle
      v-model="model.playSounds"
      :label="t('gameMode.stopwatch.settings.field.playSounds')"
      data-testid="stopwatch-play-sounds"
    />
  </q-form>
</template>

<script lang="ts" setup>
import { QForm } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import type { StopwatchSettings } from '@/../common/gameSettings/StopwatchSettings';
import type { SettingsFormApi } from '@/components/gameModes/settingsForm';

/** Store- and dialog-independent stopwatch settings fields. See plan §13. */
const model = defineModel<StopwatchSettings>({ required: true });

const { t } = useI18n();

const form = ref<QForm | null>(null);

defineExpose<SettingsFormApi>({
  validate: () => form.value?.validate() ?? Promise.resolve(true),
  // Nothing to reconcile across fields for this game.
  normalize: () => undefined,
});
</script>
