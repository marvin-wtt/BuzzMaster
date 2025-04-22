<template>
  <q-btn
    aria-label="About"
    dense
    flat
    rounded
    size="sm"
    :icon="icon"
  >
    <q-menu
      v-model="menuOpen"
      anchor="bottom middle"
      self="top middle"
      style="min-width: 200px"
    >
      <div class="column no-wrap q-pa-md q-gutter-y-sm">
        <div
          v-if="status?.name === 'checking-for-update'"
          class="column"
        >
          <a class="q-mb-sm"> {{ t('updater.checkingForUpdate') }}</a>

          <q-linear-progress
            rounded
            indeterminate
          />
        </div>

        <!-- update-available -->
        <div
          v-else-if="status?.name === 'update-available'"
          class="row no-wrap justify-between q-gutter-x-sm"
        >
          <div class="column">
            {{ t('updater.updateAvailable') }}

            <div class="text-caption">
              {{ status.info.version }} / {{ updateSize(status.info) }}
            </div>
          </div>

          <q-btn
            icon="download"
            dense
            rounded
            color="primary"
            class="self-center"
            @click="downloadUpdate"
          />
        </div>

        <!-- update-not-available -->
        <div
          v-else-if="status?.name === 'update-not-available'"
          class="row no-wrap justify-between q-gutter-x-sm"
        >
          <div class="column">
            {{ t('updater.updateNotAvailable') }}

            <div class="text-caption">
              {{ status.info.version }}
            </div>
          </div>

          <q-btn
            icon="sync"
            rounded
            dense
            color="primary"
            class="self-center"
            @click="checkForUpdates"
          />
        </div>

        <!-- download-progress -->
        <div
          v-else-if="status?.name === 'download-progress'"
          class="column no-wrap q-gutter-y-xs"
        >
          {{ t('updater.downloadProgress') }}

          <div class="text-right text-caption">
            {{ humanStorageSize(status.info.transferred) }} /
            {{ humanStorageSize(status.info.total) }}
          </div>

          <div class="row q-gutter-sm">
            <div class="col-grow column justify-center">
              <q-linear-progress
                :value="status.info.percent / 100"
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

        <!-- update-cancelled -->
        <div
          v-else-if="status?.name === 'update-cancelled'"
          class="row no-wrap justify-between q-gutter-x-sm"
        >
          <div class="column">
            {{ t('updater.updateCanceled') }}

            <div class="text-caption">
              {{ status.info.version }} / {{ updateSize(status.info) }}
            </div>
          </div>

          <q-btn
            icon="download"
            dense
            rounded
            color="primary"
            class="self-center"
            @click="downloadUpdate"
          />
        </div>

        <!-- update-downloaded -->
        <div
          v-else-if="status?.name === 'update-downloaded'"
          class="row no-wrap justify-between q-gutter-x-sm"
        >
          <div class="column">
            {{ t('updater.updateDownloaded') }}

            <div class="text-caption">
              {{ status.info.version }}
            </div>
          </div>

          <q-btn
            icon="restart_alt"
            dense
            rounded
            color="primary"
            class="self-center"
            @click="installUpdate"
          />
        </div>

        <!-- error -->
        <div
          v-else-if="status?.name === 'error'"
          class="row no-wrap justify-between q-gutter-x-sm"
        >
          <q-icon
            size="lg"
            name="error_outline"
            class="self-center"
          />
          <div class="column q-gutter-sm">
            {{ t('updater.error') }}
            <a class="text-caption">
              {{ status.error.message }}
            </a>
          </div>
        </div>

        <div
          v-else
          class="row no-wrap justify-between q-gutter-x-sm"
        >
          <div class="column">
            {{ t('updater.search') }}

            <div class="text-caption">
              {{ version }}
            </div>
          </div>

          <q-btn
            dense
            rounded
            color="primary"
            icon="sync"
            class="self-center"
            @click="checkForUpdates"
          />
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format } from 'quasar';
import type { UpdateInfo } from 'electron-updater';
import { useUpdaterStore } from 'stores/updater-store';
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const updaterStore = useUpdaterStore();
const { status, version } = storeToRefs(updaterStore);
const { humanStorageSize } = format;

const menuOpen = ref<boolean>(false);

const icon = computed<string>(() => {
  switch (status.value?.name) {
    case 'update-available':
      return 'download';
    case 'checking-for-update':
    case 'download-progress':
      return 'sync';
    case 'update-downloaded':
      return 'update';
    case 'error':
      return 'error_outline';
    case 'update-not-available':
    default:
      return 'o_info';
  }
});

function updateSize(info: UpdateInfo): string {
  const bytes = info.files.reduce(
    (total, file) => (file.size ? total + file.size : total),
    0,
  );

  return humanStorageSize(bytes);
}

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
