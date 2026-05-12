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
        <q-form
          ref="form"
          class="column q-gutter-y-sm"
        >
          <q-input
            v-model.number="settings.answerTime"
            :label="t('gameMode.simon.settings.field.answerTime')"
            :hint="
              settings.answerTime === 0
                ? t('gameMode.simon.settings.field.answerTimeDisabled')
                : ''
            "
            type="number"
            :rules="[(val: number) => val >= 0 || '≥ 0']"
            hide-bottom-space
            rounded
            outlined
          >
            <template #prepend>
              <q-icon name="timer" />
            </template>
          </q-input>

          <q-select
            v-model="settings.showingSpeed"
            :label="t('gameMode.simon.settings.field.showingSpeed')"
            :options="speedOptions"
            emit-value
            map-options
            rounded
            outlined
          >
            <template #prepend>
              <q-icon name="speed" />
            </template>
          </q-select>

          <q-toggle
            v-model="settings.autoNextRound"
            :label="t('gameMode.simon.settings.field.autoNextRound')"
          />

          <q-toggle
            v-model="settings.lastManStanding"
            :label="t('gameMode.simon.settings.field.lastManStanding')"
          />

          <q-input
            v-model.number="settings.winnerPoints"
            :label="t('gameMode.simon.settings.field.winnerPoints')"
            :hint="
              settings.winnerPoints === 0
                ? t('gameMode.simon.settings.field.winnerPointsDisabled')
                : ''
            "
            type="number"
            :rules="[(val: number) => val >= 0 || '≥ 0']"
            hide-bottom-space
            rounded
            outlined
          >
            <template #prepend>
              <q-icon name="emoji_events" />
            </template>
          </q-input>
        </q-form>
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
import { QForm, useDialogPluginComponent } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { ref, toRaw } from 'vue';
import type { SimonSettings } from 'app/common/gameSettings/SimonSettings';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const gameSettingsStore = useGameSettingsStore();
const form = ref<QForm | null>(null);
const settings = ref<SimonSettings>(
  structuredClone(toRaw(gameSettingsStore.simonSettings)),
);

const speedOptions = [
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.slow'),
    value: 0.5,
  },
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.normal'),
    value: 1,
  },
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.fast'),
    value: 2,
  },
  {
    label: t('gameMode.simon.settings.field.showingSpeedOption.veryFast'),
    value: 3,
  },
];

const onOk = async () => {
  const valid = await form.value?.validate();

  if (!valid) {
    return;
  }

  gameSettingsStore.simonSettings = settings.value;
  onDialogOK();
};
</script>
