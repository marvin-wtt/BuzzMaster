<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin">
      <q-card-section class="text-h5">
        {{ t('devices.missing.title') }}
      </q-card-section>
      <q-card-section class="text-justify">
        {{ t('devices.missing.description') }}
      </q-card-section>
      <q-card-section>
        <ul>
          <li>{{ t('devices.missing.steps.1') }}</li>
          <li>{{ t('devices.missing.steps.2') }}</li>
          <li>{{ t('devices.missing.steps.3') }}</li>
          <li>{{ t('devices.missing.steps.4') }}</li>
          <li>{{ t('devices.missing.steps.5') }}</li>
        </ul>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('devices.missing.action.ok')"
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
import { useI18n } from 'vue-i18n';

defineEmits([...useDialogPluginComponent.emits]);

const { t } = useI18n();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
</script>

<style scoped></style>
