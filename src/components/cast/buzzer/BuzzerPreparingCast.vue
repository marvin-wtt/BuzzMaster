<template>
  <div class="column justify-center col-11">
    <div class="text-center text-h1 q-pa-lg">
      {{ t('cast.buzzer.preparing.title') }}
    </div>

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
          <q-item-section>
            {{ t('cast.buzzer.preparing.settings.answerTime') }}
          </q-item-section>
          <q-item-section side> {{ settings.answerTime }} s </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="replay" />
          </q-item-section>
          <q-item-section>
            {{ t('cast.buzzer.preparing.settings.attempts') }}
          </q-item-section>
          <q-item-section side>
            <template v-if="settings.multipleAttempts">
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
            {{ t('cast.buzzer.preparing.settings.leaderboard.correct') }}
          </q-item-section>
          <q-item-section side>
            {{
              t(
                'cast.buzzer.preparing.settings.leaderboard.points',
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
            {{ t('cast.buzzer.preparing.settings.leaderboard.wrong') }}
          </q-item-section>
          <q-item-section side>
            {{
              t(
                'cast.buzzer.preparing.settings.leaderboard.points',
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
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { useI18n } from 'vue-i18n';
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';

const { t } = useI18n();
const castStore = useCastStore();

const settings = computed<BuzzerSettings>(() => {
  return castStore.gameSettings.buzzer;
});
</script>

<style scoped></style>
