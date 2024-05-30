<template>
  <q-btn
    aria-label="Battery saving"
    dense
    flat
    rounded
    size="sm"
    :icon="icon"
  >
    <q-menu
      anchor="bottom middle"
      self="top middle"
      style="width: 200px"
    >
      <div class="column no-wrap q-pa-md q-gutter-y-sm">
        <div
          v-if="status?.name === 'checking-for-update'"
          class="column"
        >
          <a class="q-mb-sm"> {{ t('update.checking-for-update') }}</a>

          <q-linear-progress
            rounded
            indeterminate
          />
        </div>

        <div v-else-if="status?.name === 'update-available'">
          <a>{{ t('update.available') }}</a>

          {{ status.info.version }}

          <q-btn
            icon="download"
            dense
            rounded
            color="primary"
            @click="downloadUpdate"
          />
        </div>

        <div
          v-else-if="status?.name === 'update-not-available'"
          class="column q-gutter-sm"
        >
          {{ t('update.not_available') }}

          <q-btn
            icon="sync"
            @click="checkForUpdates"
          />
        </div>

        <div v-else-if="status?.name === 'download-progress'">
          {{ t('update.download-progress') }}

          <div class="text-right">
            <!-- TODO format data rate -->
            {{ status.info.transferred }} / {{ status.info.total }} ({{
              status.info.bytesPerSecond
            }}
            Bps)
          </div>

          <div class="row q-gutter-sm">
            <div class="col-grow column justify-center">
              <q-linear-progress
                :value="status.info.percent"
                stripe
              />
            </div>

            <q-btn
              icon="close"
              size="xs"
              dense
              rounded
              @click="cancelDownload"
            />
          </div>
        </div>

        <div v-else-if="status?.name === 'update-downloaded'">
          {{ t('update.downloaded') }}

          <q-btn
            icon="restart_alt"
            size="xs"
            dense
            @click="installUpdate"
          />
        </div>

        <div v-else-if="status?.name === 'error'">
          <q-icon name="error" />
          {{ status.error.message }}
        </div>

        <div v-else>
          {{ t('update.check') }}

          <q-btn
            dense
            rounded
            color="primary"
            icon="sync"
            @click="checkForUpdates"
          />
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { AppUpdate } from 'app/common';
import { useI18n } from 'vue-i18n';

// TODO Add translations
const { t } = useI18n();

const status = ref<AppUpdate>({
  name: 'download-progress',
  info: {
    total: 10000,
    transferred: 100,
    percent: 0.6,
    delta: 0,
    bytesPerSecond: 100,
  },
});

window.appAPI.onUpdateInfo((data) => {
  status.value = data;
});

const icon = computed<string>(() => {
  switch (status.value?.name) {
    case 'checking-for-update':
    case 'update-available':
      return 'download';
    case 'download-progress':
      return 'sync';
    case 'update-downloaded':
      return 'restart_alt';
    case 'error':
      return 'error';
    case 'update-not-available':
    default:
      return 'update';
  }
});

function checkForUpdates() {
  window.appAPI.checkForUpdate();
}

function downloadUpdate() {
  window.appAPI.downloadUpdate();
}

function cancelDownload() {
  window.appAPI.cancelUpdate();
}

function installUpdate() {
  window.appAPI.installUpdate();
}
</script>

<style scoped></style>
