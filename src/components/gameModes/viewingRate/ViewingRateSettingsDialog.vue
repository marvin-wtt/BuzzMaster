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
          {{ t('gameMode.viewingRate.settings.title') }}
        </a>
      </q-card-section>

      <q-card-section>
        <q-form
          ref="form"
          class="column q-gutter-y-sm"
        >
          <q-toggle
            :label="t('gameMode.viewingRate.settings.field.startViewing')"
            v-model="settings.startViewing"
          />
          <q-toggle
            :label="t('gameMode.viewingRate.settings.field.readyCheck')"
            v-model="settings.readyCheck"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('gameMode.viewingRate.settings.action.ok')"
          color="primary"
          @click="onOk"
          rounded
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { QForm, useDialogPluginComponent } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { ref, toRaw } from 'vue';
import { ViewingRateSettings } from 'app/common/gameSettings/ViewingRateSettings';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const gameSettingsStore = useGameSettingsStore();
const form = ref<QForm | null>(null);
const settings = ref<ViewingRateSettings>(
  structuredClone(toRaw(gameSettingsStore.viewingRateSettings)),
);

const onOk = async () => {
  const valid = await form.value?.validate();

  if (!valid) {
    return;
  }

  gameSettingsStore.viewingRateSettings = settings.value;
  onDialogOK();
};
</script>

<style scoped></style>
