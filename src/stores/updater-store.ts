import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';
import type { AppUpdate } from 'app/common';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export const useUpdaterStore = defineStore('updater', () => {
  const quasar = useQuasar();
  const { t } = useI18n();

  const version = ref<string>();
  const status = ref<AppUpdate>();

  window.appAPI
    .getVersion()
    .then((value) => (version.value = value))
    .catch((reason) => {
      console.error(`Failed to check for latest version: ${reason}`);
    });

  window.appAPI.onUpdateInfo((data) => {
    status.value = data;

    sendNotification();
  });

  sendNotification();

  function sendNotification() {
    if (status.value?.name !== 'update-available') {
      return;
    }

    quasar.notify({
      color: 'primary',
      caption: status.value.name,
      actions: [
        {
          icon: 'download',
          color: 'white',
          rounded: true,
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
