import type { IController } from '@/plugins/buzzer/types';

export type StopwatchEntry = {
  controller: IController;
  time: number | undefined;
};
