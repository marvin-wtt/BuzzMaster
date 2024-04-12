import { onUnmounted, ref } from 'vue';

export type TimerOptions = {
  direction: 'down' | 'up';
  updateRate: number;
};

export function useTimer(options?: Partial<TimerOptions>) {
  let intervalId: NodeJS.Timeout | undefined;
  let timerStartTime: number;
  let initialTime: number;

  const time = ref<number>(0);
  const updateRate: number = options?.updateRate ?? 0;
  const countDown: boolean = options?.direction === 'down';

  onUnmounted(() => {
    stopTimer();
  });

  const startTimer = () => {
    const timeout = 1000 / updateRate;

    initialTime = time.value;
    timerStartTime = new Date().getTime();

    intervalId = setInterval(tick, timeout);
  };

  const tick = () => {
    if (time.value <= 0 && countDown) {
      stop();
    }

    time.value = exactTime();
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = undefined;
  };

  const exactTime = (): number => {
    if (timerStartTime === undefined || initialTime === undefined) {
      return time.value;
    }

    const now = new Date().getTime();
    const elapsedTime = (now - timerStartTime) / 1000;
    const multiplier = countDown ? -1 : 1;

    return initialTime + elapsedTime * multiplier;
  };

  return {
    time,

    startTimer,
    stopTimer,
    exactTime,
  };
}
