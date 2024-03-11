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
        <a class="text-h5"> Buzzer Question Settings </a>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm">
        <q-input
          label="Answer time"
          v-model.number="buzzerSettings.answerTime"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="timer" />
          </template>
        </q-input>

        <q-toggle
          label="Allow multiple attempts per team"
          v-model="buzzerSettings.multipleAttempts"
        />

        <q-toggle
          label="Play sounds"
          v-model="buzzerSettings.playSounds"
        />

        <q-input
          v-if="buzzerSettings.playSounds"
          label="Start countdown beep at"
          v-model.number="buzzerSettings.countDownBeepStartAt"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="timer" />
          </template>
        </q-input>

        <div class="text-body1">Scores</div>

        <q-input
          label="Correct answer"
          v-model.number="buzzerSettings.pointsCorrect"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="check" />
          </template>
        </q-input>

        <q-input
          label="Wrong answer"
          hint="Enter a negative number to subtract points"
          v-model.number="buzzerSettings.pointsWrong"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="close" />
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

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const { buzzerSettings } = useQuestionSettingsStore();
</script>

<style scoped></style>
