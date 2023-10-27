import { ref } from 'vue';
import {
  BuzzerButton,
  Dongle,
} from 'src/composables/buzzer/types';
import { Device } from 'src/composables/buzzer/device';

interface ButtonEvent {
  type: 'pressed' | 'released';
  button: BuzzerButton;
  controller: string;
}

interface ButtonPressedEvent extends ButtonEvent {
  type: 'pressed';
}

interface ButtonReleasedEvent extends ButtonEvent {
  type: 'released';
}

const useBuzzer = () => {
  const dongles = ref<Dongle[]>([]);
  const ready = ref<boolean>(false);

  const init = async () => {
    const devices = await navigator.hid.getDevices();

    // Load all already connected devices
    dongles.value = await Promise.all(
      devices.map(async (device) => Device(device))
    );

    navigator.hid.addEventListener('connect', async (event) => {
      const { device } = event;
      dongles.value.push(await Device(device));
    });

    navigator.hid.addEventListener('disconnect', (event) => {
      const { device } = event;

      const index = dongles.value.findIndex((dongle) => dongle.device === device);
      if (index === -1) {
        return;
      }

      dongles.value.splice(index, 1);
    });
  };

  const reset = () => {
    // TODO Reset LEDs
  };

  // initiate listeners
  init().then(() => {
    ready.value = true;
  });

  return {
    dongles,
    reset,
  };
};
export default useBuzzer;
