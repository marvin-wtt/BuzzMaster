import { inject } from 'vue';
import { IBuzzerApi, IBuzzerPlugin } from 'src/plugins/buzzer/types';
import { initHidDeviceManager } from 'src/plugins/buzzer/hid';
import { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';

export const useBuzzer = () => {
  const buzzerApi = inject<IBuzzerApi>('buzzer');

  if (!buzzerApi) {
    throw 'Buzzer Api not installed.';
  }

  return buzzerApi;
};

const deviceManagers: IBuzzerPlugin[] = [initHidDeviceManager];

export const initBuzzerApi = async (): Promise<IBuzzerApi> => {
  const api = new BuzzerApi();

  // Init all device managers
  await Promise.all(deviceManagers.map((init) => init(api)));

  return api;
};
