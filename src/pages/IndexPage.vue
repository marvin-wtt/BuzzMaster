<template>
  <q-page class="column justify-between">
    <div class="col-grow column items-center justify-evenly">
      <a class="text-h3 text-center">
        {{ t('app_name') }}
      </a>

      <q-img
        src="logo.png"
        alt="logo"
        style="width: 250px"
      />

      <div class="column q-gutter-lg">
        <q-btn
          :label="t('action.start')"
          icon="play_arrow"
          to="gameModes"
          color="primary"
          rounded
        />

        <q-btn
          :label="t('action.leaderboard')"
          icon="emoji_events"
          to="leaderboard"
          color="primary"
          rounded
        />

        <q-btn
          :label="t('action.devices')"
          icon="sports_esports"
          to="devices"
          color="primary"
          rounded
        />
      </div>
    </div>

    <div
      v-if="quasar.platform.is.electron"
      class="self-center q-pa-sm"
    >
      v{{ version }}
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUpdaterStore } from 'stores/updater-store';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

const quasar = useQuasar();
const { t } = useI18n();
const updaterStore = useUpdaterStore();
const { version } = storeToRefs(updaterStore);
</script>
