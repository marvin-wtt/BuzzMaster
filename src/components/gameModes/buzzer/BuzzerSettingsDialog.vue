<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="max-width: 20rem"
    >
      <q-card-section>
        <a class="text-h5">{{ t('gameMode.buzzer.settings.title') }}</a>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm">
        <q-input
          :label="t('gameMode.buzzer.settings.field.answerTime')"
          v-model.number="buzzerSettings.answerTime"
          type="number"
          :rules="[isNumber]"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="timer" />
          </template>
        </q-input>

        <q-toggle
          :label="t('gameMode.buzzer.settings.field.multipleAttempts')"
          v-model="buzzerSettings.multipleAttempts"
        />

        <q-toggle
          :label="t('gameMode.buzzer.settings.field.playSounds')"
          v-model="buzzerSettings.playSounds"
        />

        <q-input
          v-if="buzzerSettings.playSounds"
          :label="t('gameMode.buzzer.settings.field.beepAt')"
          v-model.number="buzzerSettings.countDownBeepStartAt"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="timer" />
          </template>
        </q-input>

        <div class="text-body1">
          {{ t('gameMode.buzzer.settings.field.points') }}
        </div>

        <q-input
          :label="t('gameMode.buzzer.settings.field.pointsCorrect')"
          v-model.number="buzzerSettings.pointsCorrect"
          type="number"
          :rules="[isNumber]"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="check" />
          </template>
        </q-input>

        {{ buzzerSettings.pointsCorrect }}

        <q-input
          :label="t('gameMode.buzzer.settings.field.pointsWrong.label')"
          :hint="t('gameMode.buzzer.settings.field.pointsWrong.hint')"
          v-model.number="buzzerSettings.pointsWrong"
          type="number"
          :rules="[isNumber]"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="close" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('gameMode.buzzer.settings.action.ok')"
          color="primary"
          rounded
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { isNumber } from 'lodash-es';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const { buzzerSettings } = useGameSettingsStore();
</script>

<style scoped></style>
