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
        <a class="text-h5">Quiz Question Settings </a>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm">
        <q-select
          v-model="quizSettings.activeButtons"
          :options="activeBuzzerOptions"
          label="Active buttons"
          :rules="[
            (val: unknown[]) => val.length >= 2 || 'Activate at least two buttons'
          ]"
          multiple
          emit-value
          map-options
          outlined
          rounded
        >
          <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="selected"
                  @update:model-value="toggleOption(opt)"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-model="quizSettings.changeMode"
          label="Allow answer change"
          :options="changeModeOptions"
          emit-value
          map-options
          outlined
          rounded
        />

        <q-input
          label="Answer time"
          v-model.number="quizSettings.answerTime"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="timer" />
          </template>
        </q-input>

        <q-select
          v-model="quizSettings.resultMode"
          label="Result Mode"
          :options="resultOption"
          emit-value
          map-options
          outlined
          rounded
        />

        <q-toggle
          label="Play sounds"
          v-model="quizSettings.playSounds"
        />

        <q-input
          v-if="quizSettings.playSounds"
          label="Start countdown beep at"
          v-model.number="quizSettings.countDownBeepStartAt"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="timer" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Ok"
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
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { BuzzerButton } from 'src/plugins/buzzer/types';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const { quizSettings } = useQuestionSettingsStore();

const changeModeOptions = [
  {
    label: 'Never',
    value: 'never',
  },
  {
    label: 'Always',
    value: 'always',
  },
  {
    label: 'Confirm',
    value: 'confirm',
  },
];

const resultOption = [
  {
    label: 'Table',
    value: 'table',
  },
  {
    label: 'Bar Cart',
    value: 'bar',
  },
];

const activeBuzzerOptions = [
  {
    label: 'Blue',
    value: BuzzerButton.BLUE,
  },
  {
    label: 'Orange',
    value: BuzzerButton.ORANGE,
  },
  {
    label: 'Green',
    value: BuzzerButton.GREEN,
  },
  {
    label: 'Yellow',
    value: BuzzerButton.YELLOW,
  },
];
</script>

<style scoped></style>
