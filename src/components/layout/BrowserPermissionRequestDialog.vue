<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="max-width: 22rem"
    >
      <q-card-section class="text-h5">
        {{ t('demo.title') }}
      </q-card-section>

      <q-card-section v-if="isSupported">
        <p>{{ t('demo.message') }}</p>
        <p>{{ t('demo.permissions') }}</p>
        <p>
          <i>{{ t('demo.help') }}</i>
        </p>
      </q-card-section>

      <q-card v-else>
        {{ t('demo.unsupported') }}
      </q-card>

      <q-card-actions align="center">
        <q-btn
          :label="t('demo.action.ok')"
          color="primary"
          rounded
          :loading
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
import { PlayStation2Device } from 'src/plugins/buzzer/hid/PlayStation2Device';
import { PlayStation3Device } from 'src/plugins/buzzer/hid/PlayStation3Device';
import { computed, ref } from 'vue';

defineEmits([...useDialogPluginComponent.emits]);

const quasar = useQuasar();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();
const loading = ref<boolean>(false);

const isSupported = computed<boolean>(() => {
  return (
    quasar.platform.is.chrome ||
    quasar.platform.is.edge ||
    quasar.platform.is.opera
  );
});

async function requestPermissions() {
  loading.value = true;
  try {
    await navigator.hid.requestDevice({
      filters: [
        {
          vendorId: PlayStation2Device.VENDOR_ID,
          productId: PlayStation2Device.PRODUCT_ID,
        },
        {
          vendorId: PlayStation3Device.VENDOR_ID,
          productId: PlayStation3Device.PRODUCT_ID,
        },
      ],
    });

    window.open('/', 'MsgWindow', 'width=500,height=800');
  } catch (reason: unknown) {
    console.error(reason);
  } finally {
    loading.value = false;
  }

  onDialogOK();
}
</script>

<style scoped></style>
