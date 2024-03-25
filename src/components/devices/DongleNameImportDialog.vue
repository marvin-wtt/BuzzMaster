<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin">
      <q-card-section class="text-h5">
        {{ t('devices.names.title') }}
      </q-card-section>
      <q-card-section>
        {{ t('devices.names.description') }}
      </q-card-section>
      <q-card-section>
        <q-file
          v-model="file"
          :label="t('devices.names.field.label')"
          :hint="t('devices.names.field.hint')"
          accept=".txt"
          rounded
          outlined
          clearable
          :error="!!error"
          :error-message="error"
          @update="error = undefined"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          :label="t('devices.names.action.cancel')"
          color="primary"
          outline
          rounded
          @click="onDialogCancel"
        />
        <q-btn
          :label="t('devices.names.action.save')"
          color="primary"
          rounded
          :disable="!file"
          @click="onDialogSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const file = ref<File>();
const error = ref<string>();

defineEmits([...useDialogPluginComponent.emits]);

const { t } = useI18n();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const readFile = (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const readNames = async (file: File): Promise<string[]> => {
  const content = await readFile(file);

  if (typeof content !== 'string') {
    throw 'Unexpected file content';
  }

  return content
    .split('\n')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

const onDialogSave = async () => {
  if (!file.value) {
    return;
  }

  try {
    const names = await readNames(file.value);
    onDialogOK(names);
  } catch (e) {
    if (e instanceof Error) {
      error.value = e.message;
    } else if (typeof e === 'string') {
      error.value = e;
    } else {
      error.value = 'Error';
    }
  }
};
</script>

<style scoped></style>
