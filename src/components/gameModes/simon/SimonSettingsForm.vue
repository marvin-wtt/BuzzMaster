<template>
  <q-form
    ref="form"
    class="column q-gutter-y-sm"
  >
    <q-input
      v-model.number="model.answerTime"
      :label="t('gameMode.simon.settings.field.answerTime')"
      :hint="
        model.answerTime === 0
          ? t('gameMode.simon.settings.field.answerTimeDisabled')
          : ''
      "
      type="number"
      :rules="[(val: number) => val >= 0 || '≥ 0']"
      hide-bottom-space
      rounded
      outlined
      data-testid="simon-answer-time"
    >
      <template #prepend>
        <q-icon name="timer" />
      </template>
    </q-input>

    <q-select
      v-model="model.showingSpeed"
      :label="t('gameMode.simon.settings.field.showingSpeed')"
      :options="speedOptions"
      emit-value
      map-options
      rounded
      outlined
      data-testid="simon-showing-speed"
    >
      <template #prepend>
        <q-icon name="speed" />
      </template>
    </q-select>

    <q-toggle
      v-model="model.autoNextRound"
      :label="t('gameMode.simon.settings.field.autoNextRound')"
      data-testid="simon-auto-next-round"
    />

    <q-toggle
      v-model="model.lastManStanding"
      :label="t('gameMode.simon.settings.field.lastManStanding')"
      data-testid="simon-last-man-standing"
    />

    <q-input
      v-model.number="model.winnerPoints"
      :label="t('gameMode.simon.settings.field.winnerPoints')"
      :hint="
        model.winnerPoints === 0
          ? t('gameMode.simon.settings.field.winnerPointsDisabled')
          : ''
      "
      type="number"
      :rules="[(val: number) => val >= 0 || '≥ 0']"
      hide-bottom-space
      rounded
      outlined
      data-testid="simon-winner-points"
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
import type { SimonSettings } from '@/../common/gameSettings/SimonSettings';
import type { SettingsFormApi } from '@/components/gameModes/settingsForm';

/**
 * Simon settings fields, with no knowledge of Pinia, dialogs or PowerPoint
 * (plan section 13).
 *
 * Used by `SimonSettingsDialog` in the desktop app and by the PowerPoint add-in's
 * configuration view. Sharing the component rather than the markup is what keeps
 * the two from drifting: a field added here appears in both, and validation
 * rules cannot disagree between them.
 *
 * The model is mutated in place, which is what `v-model` on individual fields
 * does anyway. Callers that need to react to edits should watch it deeply — the
 * add-in does exactly that to persist into the document.
 */
const model = defineModel<SimonSettings>({ required: true });

const { t } = useI18n();

const form = ref<QForm | null>(null);

const speedOptions = [
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.slow'),
    value: 0.5,
  },
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.normal'),
    value: 1,
  },
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.fast'),
    value: 2,
  },
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.veryFast'),
    value: 3,
  },
];

defineExpose<SettingsFormApi>({
  validate: () => form.value?.validate() ?? Promise.resolve(true),
  // Nothing to reconcile across fields for this game.
  normalize: () => undefined,
});
</script>
