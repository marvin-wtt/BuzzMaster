import { acceptHMRUpdate, defineStore } from 'pinia';
import { useBuzzer } from 'src/plugins/buzzer';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { IController } from 'src/plugins/buzzer/types';
import BatterySavingDialog from 'components/layout/BatterySavingDialog.vue';
import { useI18n } from 'vue-i18n';

type BatteryState = 'awake' | 'drowsy' | 'sleeping' | 'unknown';

export type BatterySavingEntry = {
  id: string;
  name: string;
  time: number;
  state: BatteryState;
};

export const useBatterySavingStore = defineStore('battery-saving', () => {
  const { controllers } = useBuzzer();
  const quasar = useQuasar();
  const { t } = useI18n();

  const batterySavingTimes = ref<BatterySavingEntry[]>([]);

  const warningThreshold = 3 * 60 * 1000;
  let showNotification = true;

  function tick() {
    const warningTime = new Date().getTime() + warningThreshold;

    batterySavingTimes.value = controllers.value
      .sort(sort)
      .map((controller) => ({
        id: controller.id,
        name: controller.name,
        time: remainingTime(controller.energySavingAt),
        state: getState(controller.energySavingAt),
      }));

    const affectedControllers = controllers.value.filter(
      (controller) =>
        !!controller.energySavingAt && controller.energySavingAt < warningTime,
    );

    if (showNotification && affectedControllers.length > 0) {
      showNotification = false;
      notify();
    } else if (!showNotification && affectedControllers.length === 0) {
      showNotification = true;
    }
  }

  const remainingTime = (time: number | undefined): number => {
    const ms = (time ?? 0) - new Date().getTime();
    const s = ms / 1000;

    return Math.round(s);
  };

  const getState = (time: number | undefined): BatteryState => {
    return time === undefined
      ? 'unknown'
      : isSleeping(time)
        ? 'sleeping'
        : isDrowsy(time)
          ? 'drowsy'
          : 'awake';
  };

  const isDrowsy = (time: number): boolean => {
    const warningTime = new Date().getTime() + warningThreshold;

    return time < warningTime;
  };

  const isSleeping = (time: number): boolean => {
    return new Date().getTime() >= time;
  };

  function notify() {
    quasar.notify({
      icon: 'battery_saver',
      type: 'warning',
      message: t('batterySaving.notification.message'),
      timeout: 0,
      actions: [
        {
          label: t('batterySaving.notification.action.more'),
          rounded: true,
          handler: () => {
            quasar.dialog({
              component: BatterySavingDialog,
            });
          },
        },
        {
          label: t('batterySaving.notification.action.dismiss'),
          rounded: true,
        },
      ],
    });
  }

  const criticalBatterySavingTimes = computed<BatterySavingEntry[]>(() => {
    return batterySavingTimes.value.filter(
      (value) => value.state === 'sleeping' || value.state === 'drowsy',
    );
  });

  setInterval(tick, 1000);

  return {
    batterySavingTimes,
    criticalBatterySavingTimes,
  };
});

function sort(a: IController, b: IController) {
  if (a.energySavingAt === undefined && b.energySavingAt === undefined) {
    return 0;
  }
  if (a.energySavingAt === undefined) {
    return 1;
  }
  if (b.energySavingAt === undefined) {
    return -1;
  }
  return a.energySavingAt - b.energySavingAt;
}

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useBatterySavingStore, import.meta.hot),
  );
}
