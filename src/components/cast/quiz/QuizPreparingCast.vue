<template>
  <div class="column justify-center col-11">
    <div class="text-center text-h1 q-pa-lg">
      {{ t('cast.quiz.preparing.title') }}
    </div>

    <div class="col-grow q-ma-md relative-position">
      <controller-logo
        class="absolute"
        :red="buttons.red"
        :blue="buttons.blue"
        :orange="buttons.orange"
        :green="buttons.green"
        :yellow="buttons.yellow"
      />
    </div>

    <q-separator />

    <div class="row justify-center text-h5">
      <q-list class="col-11">
        <q-item>
          <q-item-section avatar>
            <q-icon name="timer" />
          </q-item-section>
          <q-item-section>
            {{ t('cast.quiz.preparing.settings.answerTime') }}</q-item-section
          >
          <q-item-section side> {{ settings.answerTime }} s </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="swap_horiz" />
          </q-item-section>
          <q-item-section>
            {{ t('cast.quiz.preparing.settings.changeMode.label') }}
          </q-item-section>
          <q-item-section side>
            {{
              t(
                'cast.quiz.preparing.settings.changeMode.option.' +
                  settings.changeMode,
              )
            }}
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="check" />
          </q-item-section>
          <q-item-section>
            {{ t('cast.quiz.preparing.settings.score.correct') }}
          </q-item-section>
          <q-item-section side>
            {{
              t(
                'cast.quiz.preparing.settings.score.points',
                settings.pointsCorrect,
              )
            }}
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="close" />
          </q-item-section>
          <q-item-section>
            {{ t('cast.buzzer.preparing.settings.score.wrong') }}
          </q-item-section>
          <q-item-section side>
            {{
              t(
                'cast.buzzer.preparing.settings.score.points',
                settings.pointsWrong,
              )
            }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ControllerLogo from 'components/ControllerLogo.vue';
import { QuizSettings } from 'app/common/gameSettings/QuizSettings';
import { useI18n } from 'vue-i18n';
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';

const { t } = useI18n();
const castStore = useCastStore();

const settings = computed<QuizSettings>(() => {
  return castStore.gameSettings.quiz;
});

const buttons = computed(() => {
  return {
    red: settings.value.changeMode === 'confirm',
    blue: settings.value.activeButtons.includes(BuzzerButton.BLUE),
    orange: settings.value.activeButtons.includes(BuzzerButton.ORANGE),
    green: settings.value.activeButtons.includes(BuzzerButton.GREEN),
    yellow: settings.value.activeButtons.includes(BuzzerButton.YELLOW),
  };
});
</script>

<style scoped></style>
