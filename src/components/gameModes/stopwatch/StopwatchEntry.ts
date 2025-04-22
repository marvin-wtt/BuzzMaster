import type { IController } from 'src/plugins/buzzer/types';

export type StopwatchEntry = {
  controller: IController;
  time: number | undefined;
};
