<template>
  <div class="column justify-center">
    <div class="text-center text-h1 q-pa-lg">Buzzer</div>

    <div class="col-grow q-ma-md relative-position">
      <controller-logo
        class="absolute"
        red
      />
    </div>

    <q-separator />

    <div class="row justify-center text-h5">
      <q-list class="col-11">
        <q-item>
          <q-item-section avatar>
            <q-icon name="timer" />
          </q-item-section>
          <q-item-section>Answer time</q-item-section>
          <q-item-section side>
            {{ props.settings.answerTime }} s
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="replay" />
          </q-item-section>
          <q-item-section>
            {{ t('cast.buzzer.preparing.settings.attempts') }}
          </q-item-section>
          <q-item-section side>
            <template v-if="props.settings.multipleAttempts">
              <q-icon name="all_inclusive" />
            </template>
            <template v-else> 1 </template>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="check" />
          </q-item-section>
          <q-item-section>
            {{ t('cast.buzzer.preparing.settings.score.correct') }}
          </q-item-section>
          <q-item-section side>
            {{
              t(
                'cast.buzzer.preparing.settings.score.points',
                props.settings.pointsCorrect,
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
                props.settings.pointsWrong,
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
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  settings: BuzzerSettings;
}>();
</script>

<style scoped></style>
