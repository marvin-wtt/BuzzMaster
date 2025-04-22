import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { AppUpdate } from 'app/common';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export const useUpdaterStore = defineStore('updater', () => {
  const quasar = useQuasar();
  const { t } = useI18n();

  const version = ref<string>();
  const status = ref<AppUpdate>();

  watch(status, () => {
    sendNotification();
  });

  window.appAPI
    .getVersion()
    .then((value) => (version.value = value))
    .catch((reason) => {
      console.error(`Failed to check for latest version: ${reason}`);
    });

  window.appAPI.onUpdateInfo((data) => {
    status.value = data;
  });

  function sendNotification() {
    if (status.value?.name !== 'update-available') {
      return;
    }

    quasar.notify({
      color: 'primary',
      caption: `${status.value.info.version} (${status.value.info.releaseDate})`,
      actions: [
        {
          icon: 'download',
          'aria-label': t('updater.notification.action.download'),
          color: 'white',
          round: true,
          handler: window.appAPI.downloadUpdate,
        },
      ],
      message: t('updater.notification.message'),
    });
  }

  return {
    status,
    version,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUpdaterStore, import.meta.hot));
}
