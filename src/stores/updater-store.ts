import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';
import { AppUpdate } from 'app/common';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export const useUpdaterStore = defineStore('updater', () => {
  const quasar = useQuasar();
  const { t } = useI18n();

  const status = ref<AppUpdate>();

  window.appAPI.onUpdateInfo((data) => {
    status.value = data;

    sendNotification();
  });

  sendNotification();

  function sendNotification() {
    //if (status.value?.name !== 'update-available') {
    //  return;
    //}

    quasar.notify({
      color: 'primary',
      caption: '1.0.0',
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
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUpdaterStore, import.meta.hot));
}
