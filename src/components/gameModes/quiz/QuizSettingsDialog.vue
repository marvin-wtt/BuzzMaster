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
        <a class="text-h5">{{ t('gameMode.quiz.settings.title') }}</a>
      </q-card-section>

      <q-card-section>
        <q-form
          ref="form"
          class="column q-gutter-y-sm"
        >
          <q-select
            v-model="settings.mode"
            :options="modeOptions"
            :label="t('gameMode.quiz.settings.field.mode.label')"
            emit-value
            map-options
            outlined
            rounded
          />

          <q-select
            v-model="settings.activeButtons"
            :options="activeBuzzerOptions"
            :label="t('gameMode.quiz.settings.field.activeButtons.label')"
            :rules="[
              (val: unknown[]) =>
                val.length >= 2 ||
                t('gameMode.quiz.settings.field.activeButtons.rules.maxLength'),
            ]"
            hide-bottom-space
            multiple
            emit-value
            map-options
            outlined
            rounded
          >
            <template
              v-slot:option="{ itemProps, opt, selected, toggleOption }"
            >
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>
                    {{ (opt as QSelectOption).label }}
                  </q-item-label>
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
            v-model="settings.changeMode"
            :label="t('gameMode.quiz.settings.field.changeMode.label')"
            :options="changeModeOptions"
            emit-value
            map-options
            outlined
            rounded
          />

          <q-input
            v-model.number="settings.answerTime"
            :label="t('gameMode.quiz.settings.field.answerTime')"
            type="number"
            :rules="[isNumber]"
            hide-bottom-space
            rounded
            outlined
          >
            <template #prepend>
              <q-icon name="timer" />
            </template>
          </q-input>

          <template v-if="showPoints">
            <div class="text-h6">
              {{ t('gameMode.quiz.settings.field.points') }}
            </div>

            <q-input
              v-model.number="settings.pointsCorrect"
              :label="t('gameMode.quiz.settings.field.pointsCorrect')"
              type="number"
              :rules="[isNumber]"
              hide-bottom-space
              rounded
              outlined
            >
              <template #prepend>
                <q-icon name="check" />
              </template>
            </q-input>

            <q-input
              v-model.number="settings.pointsWrong"
              :label="t('gameMode.quiz.settings.field.pointsWrong.label')"
              :hint="t('gameMode.quiz.settings.field.pointsWrong.hint')"
              type="number"
              :rules="[isNumber]"
              hide-bottom-space
              rounded
              outlined
            >
              <template #prepend>
                <q-icon name="close" />
              </template>
            </q-input>
          </template>

          <div class="text-h6">
            {{ t('gameMode.quiz.settings.field.sounds') }}
          </div>

          <q-toggle
            v-model="settings.playSounds"
            :label="t('gameMode.quiz.settings.field.playSounds')"
          />

          <q-input
            v-if="settings.playSounds"
            :label="t('gameMode.quiz.settings.field.beepAt')"
            v-model.number="settings.countDownBeepStartAt"
            type="number"
            rounded
            outlined
          >
            <template #prepend>
              <q-icon name="timer" />
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('gameMode.quiz.settings.action.ok')"
          color="primary"
          rounded
          @click="onOk"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent, type QSelectOption, QForm } from 'quasar';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';
import { isNumber } from 'lodash-es';
import { computed, ref, toRaw } from 'vue';
import type { QuizSettings } from 'app/common/gameSettings/QuizSettings';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();
const gameSettingsStore = useGameSettingsStore();

const form = ref<QForm | null>(null);
const settings = ref<QuizSettings>(
  structuredClone(toRaw(gameSettingsStore.quizSettings)),
);

const showPoints = computed<boolean>(() => {
  return settings.value.mode !== 'survey';
});

const onOk = async () => {
  const valid = await form.value?.validate();

  if (!valid) {
    return;
  }

  // Surveyjs should not get points
  if (!showPoints.value) {
    settings.value.pointsCorrect = 0;
    settings.value.pointsWrong = 0;
  }

  gameSettingsStore.quizSettings = settings.value;
  onDialogOK();
};

const changeModeOptions = [
  {
    label: t('gameMode.quiz.settings.field.changeMode.option.never'),
    value: 'never',
  },
  {
    label: t('gameMode.quiz.settings.field.changeMode.option.always'),
    value: 'always',
  },
  {
    label: t('gameMode.quiz.settings.field.changeMode.option.confirm'),
    value: 'confirm',
  },
];

const modeOptions = [
  {
    label: t('gameMode.quiz.settings.field.mode.option.normal'),
    value: 'normal',
  },
  {
    label: t('gameMode.quiz.settings.field.mode.option.survey'),
    value: 'survey',
  },
  {
    label: t('gameMode.quiz.settings.field.mode.option.elimination'),
    value: 'elimination',
  },
];

const activeBuzzerOptions = [
  {
    label: t('gameMode.quiz.settings.field.activeButtons.option.blue'),
    value: BuzzerButton.BLUE,
  },
  {
    label: t('gameMode.quiz.settings.field.activeButtons.option.orange'),
    value: BuzzerButton.ORANGE,
  },
  {
    label: t('gameMode.quiz.settings.field.activeButtons.option.green'),
    value: BuzzerButton.GREEN,
  },
  {
    label: t('gameMode.quiz.settings.field.activeButtons.option.yellow'),
    value: BuzzerButton.YELLOW,
  },
];
</script>

<style scoped></style>
