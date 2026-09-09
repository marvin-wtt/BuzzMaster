<template>
  <q-form
    ref="form"
    class="column q-gutter-y-sm"
  >
    <q-input
      v-model.number="model.answerTime"
      :label="t('gameMode.buzzer.settings.field.answerTime')"
      type="number"
      :rules="[isNumber]"
      hide-bottom-space
      rounded
      outlined
      data-testid="buzzer-answer-time"
    >
      <template #prepend>
        <q-icon name="timer" />
      </template>
    </q-input>

    <q-toggle
      v-model="model.multipleAttempts"
      :label="t('gameMode.buzzer.settings.field.multipleAttempts')"
      data-testid="buzzer-multiple-attempts"
    />

    <q-toggle
      v-model="model.playSounds"
      :label="t('gameMode.buzzer.settings.field.playSounds')"
      data-testid="buzzer-play-sounds"
    />

    <q-input
      v-if="model.playSounds"
      v-model.number="model.countDownBeepStartAt"
      :label="t('gameMode.buzzer.settings.field.beepAt')"
      type="number"
      rounded
      outlined
      data-testid="buzzer-beep-at"
    >
      <template #prepend>
        <q-icon name="timer" />
      </template>
    </q-input>

    <div class="text-body1">
      {{ t('gameMode.buzzer.settings.field.points') }}
    </div>

    <q-input
      v-model.number="model.pointsCorrect"
      :label="t('gameMode.buzzer.settings.field.pointsCorrect')"
      type="number"
      :rules="[isNumber]"
      hide-bottom-space
      rounded
      outlined
      data-testid="buzzer-points-correct"
    >
      <template #prepend>
        <q-icon name="check" />
      </template>
    </q-input>

    <q-input
      v-model.number="model.pointsWrong"
      :label="t('gameMode.buzzer.settings.field.pointsWrong.label')"
      :hint="t('gameMode.buzzer.settings.field.pointsWrong.hint')"
      type="number"
      :rules="[isNumber]"
      rounded
      outlined
      data-testid="buzzer-points-wrong"
    >
      <template #prepend>
        <q-icon name="close" />
      </template>
    </q-input>
  </q-form>
</template>

<script lang="ts" setup>
import { QForm } from 'quasar';
import { useI18n } from 'vue-i18n';
import { isNumber } from 'lodash-es';
import { ref } from 'vue';
import type { BuzzerSettings } from '@/../common/gameSettings/BuzzerSettings';
import type { SettingsFormApi } from '@/components/gameModes/settingsForm';

const model = defineModel<BuzzerSettings>({ required: true });

const { t } = useI18n();

const form = ref<QForm | null>(null);

defineExpose<SettingsFormApi>({
  validate: () => form.value?.validate() ?? Promise.resolve(true),
  // Nothing to reconcile across fields for this game.
  normalize: () => undefined,
});
</script>
