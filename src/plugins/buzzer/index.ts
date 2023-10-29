import { inject, ref } from 'vue';
import {
  ButtonChangeEventListener,
  ButtonEvent,
  ButtonEventListener,
  ButtonPressEventListener,
  ButtonReleaseEventListener,
  BuzzerApi,
  Dongle,
} from 'src/plugins/buzzer/types';
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

  const changeListener = new Set<ButtonChangeEventListener>();
  const pressedListener = new Set<ButtonPressEventListener>();
  const releasedListener = new Set<ButtonReleaseEventListener>();

  const onButtonChange = (listener: ButtonChangeEventListener) => {
    changeListener.add(listener);
  };

  const onButtonPressed = (listener: ButtonPressEventListener) => {
    pressedListener.add(listener);
  };

  const onButtonReleaseListener = (listener: ButtonReleaseEventListener) => {
    releasedListener.add(listener);
  };

  const removeListener = (
    type: 'press' | 'release' | 'change',
    listener: ButtonEventListener
  ) => {
    switch (type) {
      case 'change':
        return changeListener.delete(listener as ButtonChangeEventListener);
      case 'press':
        return pressedListener.delete(listener as ButtonPressEventListener);
      case 'release':
        return releasedListener.delete(listener as ButtonReleaseEventListener);
    }
  };

  const fireEvent = (event: ButtonEvent) => {
    changeListener.forEach((listener) => {
      listener(event);
    });

    if (event.type === 'press') {
      pressedListener.forEach((listener) => {
        listener(event);
      });
    }

    if (event.type === 'release') {
      releasedListener.forEach((listener) => {
        listener(event);
      });
    }
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
    onButtonChange,
    onButtonPressed,
    onButtonReleaseListener,
    removeListener,
  };
};
export default Buzzer;
