import { onUnmounted } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import type { IController } from 'src/plugins/buzzer/types';

type Timer = ReturnType<typeof setTimeout>;

export interface FlashOptions {
  times: number;
  onMs: number;
  offMs: number;
}

const DEFAULT_OPTIONS: FlashOptions = {
  times: 1,
  onMs: 500,
  offMs: 500,
};

export function useControllerFlasher(flashOptions: Partial<FlashOptions> = {}) {
  const options = { ...DEFAULT_OPTIONS, ...flashOptions };

  const { controllers } = useBuzzer();

  const timers = new Map<string, Timer | null>();

  function stop(controller: IController | string) {
    if (typeof controller === 'string') {
      const c = controllers.value.find((c) => c.id === controller);
      if (!c) {
        return;
      }

      controller = c;
    }

    const timer = timers.get(controller.id);

    if (timer) {
      clearTimeout(timer);
      timers.delete(controller.id);
    }

    controller.setLight(false);
  }

  function stopAll() {
    for (const id of timers.keys()) {
      stop(id);
    }
  }

  function flash(
    controller: IController | string,
    times: number = options.times,
    onMs: number = options.onMs,
    offMs: number = options.offMs,
  ) {
    if (typeof controller === 'string') {
      const c = controllers.value.find((c) => c.id === controller);
      if (!c) {
        return;
      }

      controller = c;
    }

    stop(controller);

    let count = 0;
    let on = false;

    const step = () => {
      if (count >= times * 2) {
        controller.setLight(false);
        timers.delete(controller.id);
        return;
      }

      on = !on;
      controller.setLight(on);

      count++;

      const delay = on ? onMs : offMs;
      timers.set(controller.id, setTimeout(step, delay));
    };

    step();
  }

  onUnmounted(stopAll);

  return {
    flash,
    stop,
    stopAll,
  };
}
