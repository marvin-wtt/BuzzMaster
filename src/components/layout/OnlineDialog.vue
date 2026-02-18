<template>
  <q-dialog
    ref="dialogRef"
    :persistent="!isSupported"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="max-width: 22rem"
    >
      <q-card-section class="text-h5">
        {{ t('online.title') }}
      </q-card-section>

      <q-card-section v-if="isSupported">
        <p>{{ t('online.message') }}</p>
        <p>{{ t('online.permissions') }}</p>
        <p>
          <i>{{ t('online.help') }}</i>
        </p>

        <q-checkbox
          v-model="openNewWindow"
          :label="t('online.open')"
        />
      </q-card-section>

      <q-card-section v-else>
        {{ t('online.unsupported') }}

        <ul>
          <li>Chrome >= 89</li>
          <li>Edge >= 89</li>
          <li>Opera >= 75</li>
        </ul>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('online.action.ok')"
          color="primary"
          rounded
          :disable="!isSupported"
          @click="requestPermissions"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { requestBuzzerDevicePermissions } from 'src/plugins/buzzer/permission';

defineEmits([...useDialogPluginComponent.emits]);

const quasar = useQuasar();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const openNewWindow = ref<boolean>(true);

// See https://developer.mozilla.org/en-US/docs/Web/API/HID#browser_compatibility
const isSupported = computed<boolean>(() => {
  if (!quasar.platform.is.desktop) {
    return false;
  }

  const version = quasar.platform.is.versionNumber;
  if (quasar.platform.is.chrome || quasar.platform.is.edge) {
    return version === undefined || version >= 89;
  }

  if (quasar.platform.is.opera) {
    return version === undefined || version >= 75;
  }

  return false;
});

async function requestPermissions() {
  try {
    await requestBuzzerDevicePermissions();
  } catch (error: unknown) {
    console.error(error);
  }

  onDialogOK(openNewWindow.value);
}
</script>

<style scoped></style>
