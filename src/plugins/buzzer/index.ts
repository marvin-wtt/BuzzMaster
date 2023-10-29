import { inject, ref } from 'vue';
import {
  ButtonEvent,
  ButtonEventListener,
  ButtonPressedEvent,
  ButtonPressedEventListener,
  ButtonReleasedEvent,
  ButtonReleasedEventListener,
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

  const changeListener = new Set<ButtonEventListener>();
  const pressedListener = new Set<ButtonPressedEventListener>();
  const releasedListener = new Set<ButtonReleasedEventListener>();

  const onButtonChange = (listener: ButtonEventListener) => {
    changeListener.add(listener);
  };

  const onButtonPressed = (listener: ButtonPressedEventListener) => {
    pressedListener.add(listener);
  };

  const onButtonReleaseListener = (listener: ButtonReleasedEventListener) => {
    releasedListener.add(listener);
  };

  const removeListener = (
    type: 'pressed' | 'released' | 'change',
    listener: ButtonEventListener
  ) => {
    switch (type) {
      case 'change':
        return changeListener.delete(listener);
      case 'pressed':
        return pressedListener.delete(listener);
      case 'released':
        return pressedListener.delete(listener);
    }
  };

  const fireEvent = (event: ButtonEvent) => {
    changeListener.forEach((listener) => {
      listener(event);
    });

    if (event.type === 'pressed') {
      pressedListener.forEach((listener) => {
        listener(event as ButtonPressedEvent);
      });
    }

    if (event.type === 'released') {
      releasedListener.forEach((listener) => {
        listener(event as ButtonReleasedEvent);
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
