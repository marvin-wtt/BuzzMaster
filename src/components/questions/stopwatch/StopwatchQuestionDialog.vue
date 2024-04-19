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
        <a class="text-h5">
          {{ t('question.stopwatch.settings.title') }}
        </a>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm">
        <q-toggle
          :label="t('question.stopwatch.settings.field.playSounds')"
          v-model="stopwatchSettings.playSounds"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('question.stopwatch.settings.action.ok')"
          color="primary"
          @click="onDialogOK"
          rounded
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const { stopwatchSettings } = useGameSettingsStore();
</script>

<style scoped></style>
