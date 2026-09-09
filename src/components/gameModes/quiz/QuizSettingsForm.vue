<template>
  <q-form
    ref="form"
    class="column q-gutter-y-sm"
  >
    <q-select
      v-model="model.mode"
      :options="modeOptions"
      :label="t('gameMode.quiz.settings.field.mode.label')"
      emit-value
      map-options
      outlined
      rounded
      data-testid="quiz-mode"
    />

    <q-select
      v-model="model.activeButtons"
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
      data-testid="quiz-active-buttons"
    >
      <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
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
      v-model="model.changeMode"
      :label="t('gameMode.quiz.settings.field.changeMode.label')"
      :options="changeModeOptions"
      emit-value
      map-options
      outlined
      rounded
      data-testid="quiz-change-mode"
    />

    <q-input
      v-model.number="model.answerTime"
      :label="t('gameMode.quiz.settings.field.answerTime')"
      type="number"
      :rules="[isNumber]"
      hide-bottom-space
      rounded
      outlined
      data-testid="quiz-answer-time"
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
        v-model.number="model.pointsCorrect"
        :label="t('gameMode.quiz.settings.field.pointsCorrect')"
        type="number"
        :rules="[isNumber]"
        hide-bottom-space
        rounded
        outlined
        data-testid="quiz-points-correct"
      >
        <template #prepend>
          <q-icon name="check" />
        </template>
      </q-input>

      <q-input
        v-model.number="model.pointsWrong"
        :label="t('gameMode.quiz.settings.field.pointsWrong.label')"
        :hint="t('gameMode.quiz.settings.field.pointsWrong.hint')"
        type="number"
        :rules="[isNumber]"
        hide-bottom-space
        rounded
        outlined
        data-testid="quiz-points-wrong"
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
      v-model="model.playSounds"
      :label="t('gameMode.quiz.settings.field.playSounds')"
      data-testid="quiz-play-sounds"
    />

    <q-input
      v-if="model.playSounds"
      v-model.number="model.countDownBeepStartAt"
      :label="t('gameMode.quiz.settings.field.beepAt')"
      type="number"
      rounded
      outlined
      data-testid="quiz-beep-at"
    >
      <template #prepend>
        <q-icon name="timer" />
      </template>
    </q-input>
  </q-form>
</template>

<script lang="ts" setup>
import { type QSelectOption, QForm } from 'quasar';
import { BuzzerButton } from '@/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';
import { isNumber } from 'lodash-es';
import { computed, ref } from 'vue';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import type { SettingsFormApi } from '@/components/gameModes/settingsForm';

/** Store- and dialog-independent quiz settings fields. See plan §13. */
const model = defineModel<QuizSettings>({ required: true });

const { t } = useI18n();

const form = ref<QForm | null>(null);

const showPoints = computed<boolean>(() => model.value.mode !== 'survey');

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

defineExpose<SettingsFormApi>({
  validate: () => form.value?.validate() ?? Promise.resolve(true),
  normalize: () => {
    // A survey has no right or wrong answer, so it carries no points. This used
    // to live in the dialog's OK handler, where the PowerPoint add-in could
    // never reach it.
    if (!showPoints.value) {
      model.value.pointsCorrect = 0;
      model.value.pointsWrong = 0;
    }
  },
});
</script>
