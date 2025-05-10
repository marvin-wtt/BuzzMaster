import { computed, inject, type Plugin, type App } from 'vue';
import {
  type IBuzzerApi,
  type IBuzzerPlugin,
  type IController,
} from 'src/plugins/buzzer/types';
import { initHidDeviceManager } from 'src/plugins/buzzer/hid';
import { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';

export const useBuzzer = () => {
  const buzzerApi = inject<IBuzzerApi>('buzzer');

  if (!buzzerApi) {
    throw new Error('Buzzer API not found. Make sure to install the plugin.');
  }

  const controllers = computed<IController[]>(() => {
    return buzzerApi.dongles
      .flatMap((dongle) => dongle.controllers)
      .filter((controller) => !controller.disabled);
  });

  return {
    controllers,
    dongles: buzzerApi.dongles,
    disconnectedDongles: buzzerApi.disconnectedDongles,
    buzzer: buzzerApi,
    restoreDongle: buzzerApi.restoreDongle.bind(buzzerApi),
  };
};

const deviceManagers: IBuzzerPlugin[] = [initHidDeviceManager];

export const initBuzzerApi = async (api: BuzzerApi): Promise<IBuzzerApi> => {
  // Init all device managers
  await Promise.all(deviceManagers.map((init) => init(api)));

  return api;
};

export const BuzzerPlugin: Plugin = {
  async install(app: App) {
    const api = new BuzzerApi();
    app.provide('buzzer', api);

    await initBuzzerApi(api);
  },
};
