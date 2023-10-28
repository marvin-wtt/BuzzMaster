import { inject, ref } from 'vue';
import { ButtonEvent, BuzzerApi, Dongle } from 'src/plugins/buzzer/types';
import { Device } from 'src/plugins/buzzer/device';

export const useBuzzer = () => {
  const buzzerApi = inject<BuzzerApi>('buzzer');

  if (!buzzerApi) {
    throw 'Buzzer Api not installed.';
  }

  return buzzerApi;
};

const Buzzer = (): BuzzerApi => {
  const dongles = ref<Dongle[]>([]);
  const ready = ref<boolean>(false);

  const fireEvent = (event: ButtonEvent) => {
    console.log(event.controller.name, event.button, event.type);
  };

  const init = async () => {
    const devices = await navigator.hid.getDevices();

    // Load all already connected devices
    dongles.value = await Promise.all(
      devices.map(async (device) => Device(device, fireEvent))
    );

    navigator.hid.addEventListener('connect', async (event) => {
      const { device } = event;
      dongles.value.push(await Device(device, fireEvent));
    });

    navigator.hid.addEventListener('disconnect', (event) => {
      const { device } = event;

      const index = dongles.value.findIndex(
        (dongle) => dongle.device === device
      );
      if (index === -1) {
        return;
      }

      dongles.value.splice(index, 1);
    });
  };

  const reset = () => {
    dongles.value.forEach((dongle) => {
      dongle.reset();
    });
  };

  // initiate listeners
  init().then(() => {
    ready.value = true;
  });

  return {
    dongles,
    ready,
    reset,
  };
};
export default Buzzer;
