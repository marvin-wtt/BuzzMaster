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
        <span class="text-h5">
          {{ t('gameMode.simon.settings.title') }}
        </span>
      </q-card-section>

      <q-card-section>
        <SimonSettingsForm
          ref="settingsForm"
          v-model="settings"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('gameMode.simon.settings.action.ok')"
          color="primary"
          rounded
          @click="onOk"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useGameSettingsStore } from '@/stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { ref, toRaw, useTemplateRef } from 'vue';
import type { SimonSettings } from '@/../common/gameSettings/SimonSettings';
import SimonSettingsForm from '@/components/gameModes/simon/SimonSettingsForm.vue';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const gameSettingsStore = useGameSettingsStore();
const settingsForm =
  useTemplateRef<InstanceType<typeof SimonSettingsForm>>('settingsForm');

// Edit a copy: the dialog is cancellable, so the store must not see changes
// until OK.
const settings = ref<SimonSettings>(
  structuredClone(toRaw(gameSettingsStore.simonSettings)),
);

const onOk = async () => {
  const valid = await settingsForm.value?.validate();

  if (!valid) {
    return;
  }

  settingsForm.value?.normalize();

  gameSettingsStore.simonSettings = settings.value;
  onDialogOK();
};
</script>
