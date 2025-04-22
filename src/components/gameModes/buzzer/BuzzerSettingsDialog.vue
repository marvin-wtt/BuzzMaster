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

      <q-card-section>
        <q-form
          ref="form"
          class="column q-gutter-y-sm"
        >
          <q-input
            :label="t('gameMode.buzzer.settings.field.answerTime')"
            v-model.number="settings.answerTime"
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
            v-model="settings.multipleAttempts"
          />

          <q-toggle
            :label="t('gameMode.buzzer.settings.field.playSounds')"
            v-model="settings.playSounds"
          />

          <q-input
            v-if="settings.playSounds"
            :label="t('gameMode.buzzer.settings.field.beepAt')"
            v-model.number="settings.countDownBeepStartAt"
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
            v-model.number="settings.pointsCorrect"
            type="number"
            :rules="[isNumber]"
            rounded
            outlined
          >
            <template #prepend>
              <q-icon name="check" />
            </template>
          </q-input>

          <q-input
            :label="t('gameMode.buzzer.settings.field.pointsWrong.label')"
            :hint="t('gameMode.buzzer.settings.field.pointsWrong.hint')"
            v-model.number="settings.pointsWrong"
            type="number"
            :rules="[isNumber]"
            rounded
            outlined
          >
            <template #prepend>
              <q-icon name="close" />
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('gameMode.buzzer.settings.action.ok')"
          color="primary"
          rounded
          @click="onOk"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { QForm, useDialogPluginComponent } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { isNumber } from 'lodash-es';
import { ref, toRaw } from 'vue';
import type { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const gameSettingsStore = useGameSettingsStore();
const form = ref<QForm | null>(null);
const settings = ref<BuzzerSettings>(
  structuredClone(toRaw(gameSettingsStore.buzzerSettings)),
);

const onOk = async () => {
  const valid = await form.value?.validate();

  if (!valid) {
    return;
  }

  gameSettingsStore.buzzerSettings = settings.value;
  onDialogOK();
};
</script>

<style scoped></style>
