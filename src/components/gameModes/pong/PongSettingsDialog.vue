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
        <span class="text-h5">{{ t('gameMode.pong.settings.title') }}</span>
      </q-card-section>

      <q-card-section>
        <q-form class="column q-gutter-y-sm">
          <q-input
            v-model.number="settings.rounds"
            :label="t('gameMode.pong.settings.field.rounds')"
            type="number"
            outlined
            rounded
          />

          <q-select
            v-model="settings.speed"
            :label="t('gameMode.pong.settings.field.speed')"
            :options="speedOptions"
            emit-value
            map-options
            outlined
            rounded
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('gameMode.pong.settings.action.ok')"
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
import { useGameSettingsStore } from 'stores/game-settings-store';
import { useI18n } from 'vue-i18n';
import { ref, toRaw } from 'vue';
import type {
  PongSettings,
  PongSpeedPreset,
} from 'app/common/gameSettings/PongSettings';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const gameSettingsStore = useGameSettingsStore();
const settings = ref<PongSettings>(
  structuredClone(toRaw(gameSettingsStore.pongSettings)),
);

const speedOptions: { label: string; value: PongSpeedPreset }[] = [
  'slow',
  'normal',
  'fast',
  'turbo',
].map((s) => ({
  label: t(`gameMode.pong.settings.speed.${s}`),
  value: s as PongSpeedPreset,
}));

const onOk = () => {
  gameSettingsStore.pongSettings = settings.value;
  onDialogOK();
};
</script>
