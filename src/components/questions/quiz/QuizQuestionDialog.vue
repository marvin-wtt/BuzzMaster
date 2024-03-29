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
        <a class="text-h5">{{ t('question.quiz.settings.title') }}</a>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm">
        <q-select
          v-model="quizSettings.activeButtons"
          :options="activeBuzzerOptions"
          :label="t('question.quiz.settings.field.activeButtons.label')"
          :rules="[
            (val: unknown[]) =>
              val.length >= 2 ||
              t('question.quiz.settings.field.activeButtons.rules.maxLength'),
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
                <q-item-label>{{ (opt as QSelectOption).label }}</q-item-label>
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
          :label="t('question.quiz.settings.field.changeMode.label')"
          :options="changeModeOptions"
          emit-value
          map-options
          outlined
          rounded
        />

        <q-input
          v-model.number="quizSettings.answerTime"
          :label="t('question.quiz.settings.field.answerTime')"
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
          :label="t('question.quiz.settings.field.resultMode.label')"
          :options="resultOption"
          emit-value
          map-options
          outlined
          rounded
        />

        <q-toggle
          v-model="quizSettings.playSounds"
          :label="t('question.quiz.settings.field.playSounds')"
        />

        <q-input
          v-if="quizSettings.playSounds"
          :label="t('question.quiz.settings.field.beepAt')"
          v-model.number="quizSettings.countDownBeepStartAt"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="timer" />
          </template>
        </q-input>

        <div class="text-body1">
          {{ t('question.quiz.settings.field.points') }}
        </div>

        <q-input
          v-model.number="quizSettings.pointsCorrect"
          :label="t('question.quiz.settings.field.pointsCorrect')"
          type="number"
          rounded
          outlined
        >
          <template #prepend>
            <q-icon name="check" />
          </template>
        </q-input>

        <q-input
          v-model.number="quizSettings.pointsWrong"
          :label="t('question.quiz.settings.field.pointsWrong.label')"
          :hint="t('question.quiz.settings.field.pointsWrong.hint')"
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
          :label="t('question.quiz.settings.action.ok')"
          color="primary"
          rounded
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent, QSelectOption } from 'quasar';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();
const { quizSettings } = useQuestionSettingsStore();

const changeModeOptions = [
  {
    label: t('question.quiz.settings.field.changeMode.option.never'),
    value: 'never',
  },
  {
    label: t('question.quiz.settings.field.changeMode.option.always'),
    value: 'always',
  },
  {
    label: t('question.quiz.settings.field.changeMode.option.confirm'),
    value: 'confirm',
  },
];

const resultOption = [
  {
    label: t('question.quiz.settings.field.resultMode.option.table'),
    value: 'table',
  },
  {
    label: t('question.quiz.settings.field.resultMode.option.bar'),
    value: 'bar',
  },
];

const activeBuzzerOptions = [
  {
    label: t('question.quiz.settings.field.activeButtons.option.blue'),
    value: BuzzerButton.BLUE,
  },
  {
    label: t('question.quiz.settings.field.activeButtons.option.orange'),
    value: BuzzerButton.ORANGE,
  },
  {
    label: t('question.quiz.settings.field.activeButtons.option.green'),
    value: BuzzerButton.GREEN,
  },
  {
    label: t('question.quiz.settings.field.activeButtons.option.yellow'),
    value: BuzzerButton.YELLOW,
  },
];
</script>

<style scoped></style>
