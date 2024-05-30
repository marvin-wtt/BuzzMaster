import { computed, inject, Plugin, App } from 'vue';
import {
  IBuzzerApi,
  IBuzzerPlugin,
  IController,
} from 'src/plugins/buzzer/types';
import { initHidDeviceManager } from 'src/plugins/buzzer/hid';
import { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';

export const useBuzzer = () => {
  const buzzerApi = inject<IBuzzerApi>('buzzer');

  if (!buzzerApi) {
    throw 'Buzzer Api not installed.';
  }

  const controllers = computed<IController[]>(() => {
    return buzzerApi.dongles
      .flatMap((dongle) => dongle.controllers)
      .filter((controller) => !controller.disabled);
  });

  return {
    controllers,
    dongles: buzzerApi.dongles,
    buzzer: buzzerApi,
  };
};

const deviceManagers: IBuzzerPlugin[] = [initHidDeviceManager];

export const initBuzzerApi = async (api: BuzzerApi): Promise<IBuzzerApi> => {
  // Init all device managers
  await Promise.all(deviceManagers.map((init) => init(api)));

  return api;
};

export const BuzzerPlugin: Plugin = {
  install(app: App) {
    const api = new BuzzerApi();
    app.provide('buzzer', api);

    initBuzzerApi(api);
  },
};
