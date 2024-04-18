import { describe, expect, it, vi } from 'vitest';
import { mountPage } from 'app/test/vitest/utils/mount-page';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { Dialog } from 'quasar';
import { installPinia } from 'app/test/vitest/install-pinia';
import StopwatchQuestionPage from 'pages/questions/StopwatchQuestionPage.vue';
import { useGameStore } from 'stores/game-store';
import { selector } from 'app/test/vitest/utils/element-selector';
import { installFakeTimer } from 'app/test/vitest/install-timer';
import { nextTick } from 'vue';
import {
  StopwatchCompletedState,
  StopwatchPausedState,
  StopwatchRunningState,
} from 'app/common/gameState/StopwatchState';
import { createDevice } from 'app/test/vitest/utils/buzzer';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';

const mountStopwatchPage = () => mountPage(StopwatchQuestionPage);

installQuasarPlugin({ plugins: { Dialog } });
installPinia({ stubActions: false });

describe('StopwatchPage', () => {
  it('should mount component properly', () => {
    const { wrapper } = mountStopwatchPage();
    expect(wrapper.exists()).to.be.true;
  });

  describe('preparing', () => {
    it('should initiate in preparing', () => {
      mountStopwatchPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.game).toBe('stopwatch');
      expect(gameStore.state?.name).toBe('preparing');
    });

    it('should transition to running when start button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.name).toBe('preparing');

      expect(wrapper.find(selector('btn-game-start')).exists()).to.be.true;
      await wrapper.find(selector('btn-game-start')).trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should show controllers ready', async () => {
      const { wrapper } = mountStopwatchPage();

      expect(wrapper.find(selector('controllers-ready')).exists()).to.be.true;
    });

    it.todo('should show the correct amount of controllers');
  });

  describe('running', () => {
    installFakeTimer();

    const initializeStore = async (time: number = 0) => {
      const gameStore = useGameStore();

      gameStore.transition({
        game: 'stopwatch',
        name: 'running',
        time,
        result: {},
      });
      await nextTick();

      return gameStore;
    };

    it('should start the timer', async () => {
      mountStopwatchPage();
      const gameStore = await initializeStore();

      await vi.advanceTimersByTimeAsync(2000);

      const state = gameStore.state as StopwatchRunningState;
      expect(state.time).toBe(2);
    });

    it('should show the timer', async () => {
      const { wrapper } = mountStopwatchPage();
      await initializeStore(2.02);

      const timer = wrapper.find(selector('timer'));
      expect(timer.exists()).to.be.true;
      expect(timer.text()).toBe('02.02');
    });

    it('should accept a buzzer', async () => {
      const { buzzer } = mountStopwatchPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const gameStore = await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);

      const controller = getController(0);
      const state = gameStore.state as StopwatchRunningState;
      expect(state.result).toHaveProperty(controller.id, 2);
    });

    it('should turn on the LED on answer', async () => {
      const { buzzer } = mountStopwatchPage();
      const { pressAndRelease, device } = await createDevice(buzzer, 3);
      await initializeStore(2);
      const spy = vi.spyOn(device, 'updateLight');

      pressAndRelease(0, BuzzerButton.RED);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(0, true);
    });

    it('should not accept other buttons', async () => {
      const { buzzer } = mountStopwatchPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const gameStore = await initializeStore(2);

      pressAndRelease(0, BuzzerButton.YELLOW);
      pressAndRelease(0, BuzzerButton.GREEN);
      pressAndRelease(0, BuzzerButton.ORANGE);
      pressAndRelease(0, BuzzerButton.BLUE);

      const controller = getController(0);
      const state = gameStore.state as StopwatchRunningState;
      expect(state.result).not.toHaveProperty(controller.id);
    });

    it('should show the pressed controllers', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { pressAndRelease, getController } = await createDevice(buzzer, 3);
      await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);
      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      const item = wrapper.find(selector('result-item'));
      expect(item.exists()).to.be.true;

      const name = item.find(selector('result-item-name'));
      expect(name.exists()).to.be.true;
      expect(name.text()).toBe(getController(0).name);
    });

    it('should show the correct controller time', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { pressAndRelease } = await createDevice(buzzer, 3);
      await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);

      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      const item = wrapper.find(selector('result-item'));
      expect(item.exists()).to.be.true;

      const time = item.find(selector('result-item-time'));
      expect(time.exists()).to.be.true;
      expect(time.text()).toBe('00:02.00');
    });

    it('should order the result after time', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { pressAndRelease } = await createDevice(buzzer, 3);
      await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);
      await vi.advanceTimersByTimeAsync(2100);
      pressAndRelease(1, BuzzerButton.RED);

      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      const items = wrapper.findAll(selector('result-item'));
      expect(items.length).toBe(2);

      const firstTime = items[0].find(selector('result-item-time'));
      expect(firstTime.exists()).to.be.true;
      expect(firstTime.text()).toBe('00:02.00');

      const secondTime = items[1].find(selector('result-item-time'));
      expect(secondTime.exists()).to.be.true;
      expect(secondTime.text()).toBe('00:04.10');
    });

    it('should prevent multiple presses', async () => {
      const { buzzer } = mountStopwatchPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const gameStore = await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);

      gameStore.transition({
        game: 'stopwatch',
        name: 'running',
        time: 5,
        result: (gameStore.state as StopwatchRunningState).result,
      });

      pressAndRelease(0, BuzzerButton.RED);

      const controller = getController(0);
      const state = gameStore.state as StopwatchRunningState;
      expect(state.result).toHaveProperty(controller.id, 2);
    });

    it('should remove a controller', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { pressAndRelease, getController } = await createDevice(buzzer, 3);
      const gameStore = await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);
      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      await wrapper.find(selector('btn-remove-result')).trigger('click');
      // Click twice for confirmation
      // Wrapper needs to be selected again as the element changes
      await wrapper.find(selector('btn-remove-result')).trigger('click');

      const controller = getController(0);
      const state = gameStore.state as StopwatchRunningState;

      expect(state.result).not.toHaveProperty(controller.id);
    });

    it('should turn off the LED for a removed controller', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { pressAndRelease, device } = await createDevice(buzzer, 3);
      await initializeStore(2);
      const spy = vi.spyOn(device, 'updateLight');

      pressAndRelease(0, BuzzerButton.RED);
      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      await wrapper.find(selector('btn-remove-result')).trigger('click');
      // Click twice for confirmation
      // Wrapper needs to be selected again as the element changes
      await wrapper.find(selector('btn-remove-result')).trigger('click');

      expect(spy).toHaveBeenLastCalledWith(0, false);
    });

    it('should transition to completed when all controllers are pressed', async () => {
      const { buzzer } = mountStopwatchPage();
      const { pressAndRelease } = await createDevice(buzzer);
      const gameStore = await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);

      expect(gameStore.state?.name).toBe('running');

      pressAndRelease(1, BuzzerButton.RED);

      expect(gameStore.state?.name).toBe('completed');
    });

    it('should transition to paused when pause button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('running');

      const btn = wrapper.find(selector('btn-game-pause'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('paused');
    });

    it('should pause the timer when pause button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore(1);

      expect(gameStore.state?.name).toBe('running');

      const btn = wrapper.find(selector('btn-game-pause'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');
      await vi.advanceTimersByTimeAsync(1000);

      const state = gameStore.state as StopwatchPausedState;
      expect(state.time).toBe(1);
    });
  });

  describe('paused', () => {
    installFakeTimer();

    const initializeStore = async () => {
      const gameStore = useGameStore();

      gameStore.transition({
        game: 'stopwatch',
        name: 'paused',
        time: 10.1,
        result: {},
      });
      await nextTick();

      return gameStore;
    };

    const initializeStoreWithDevice = async (buzzer: BuzzerApi) => {
      const gameStore = useGameStore();
      const deviceApi = await createDevice(buzzer, 2);

      gameStore.transition({
        game: 'stopwatch',
        name: 'paused',
        time: 10.1,
        result: {
          [deviceApi.getController(0).id]: 5.2,
        },
      });
      await nextTick();

      return {
        gameStore,
        ...deviceApi,
      };
    };

    it('should prevent a button press', async () => {
      const { buzzer } = mountStopwatchPage();
      const { gameStore, getController, pressAndRelease } =
        await initializeStoreWithDevice(buzzer);

      pressAndRelease(0, BuzzerButton.RED);
      pressAndRelease(1, BuzzerButton.RED);

      const state = gameStore.state as StopwatchCompletedState;
      expect(state.result).toHaveProperty(getController(0).id, 5.2);
      expect(state.result).not.toHaveProperty(getController(1).id);
    });

    it('should transition to running when resume button is pressed', async () => {
      const { wrapper, buzzer } = mountStopwatchPage();
      const { gameStore, getController } =
        await initializeStoreWithDevice(buzzer);

      expect(gameStore.state?.name).toBe('paused');

      const btn = wrapper.find(selector('btn-game-resume'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      const state = gameStore.state as StopwatchRunningState;
      expect(state.name).toBe('running');
      expect(state.result).toHaveProperty(getController(0).id, 5.2);
      expect(state.time).toBe(10.1);
    });

    it('should transition to completed when stop button is pressed', async () => {
      const { wrapper, buzzer } = mountStopwatchPage();
      const { gameStore, getController } =
        await initializeStoreWithDevice(buzzer);

      expect(gameStore.state?.name).toBe('paused');

      const btn = wrapper.find(selector('btn-game-stop'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      const state = gameStore.state as StopwatchCompletedState;
      expect(state.name).toBe('completed');
      expect(state.result).toHaveProperty(getController(0).id, 5.2);
    });

    it('should disqualify all unpressed controllers when stop button is pressed', async () => {
      const { wrapper, buzzer } = mountStopwatchPage();
      const { gameStore, getController } =
        await initializeStoreWithDevice(buzzer);

      const btn = wrapper.find(selector('btn-game-stop'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      const state = gameStore.state as StopwatchCompletedState;
      expect(state.result).toHaveProperty(getController(0).id, 5.2);
      expect(state.result).toHaveProperty(getController(1).id, undefined);
    });

    it('should remove a controller', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { gameStore, getController } =
        await initializeStoreWithDevice(buzzer);

      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      await wrapper.find(selector('btn-remove-result')).trigger('click');
      // Click twice for confirmation
      // Wrapper needs to be selected again as the element changes
      await wrapper.find(selector('btn-remove-result')).trigger('click');

      const state = gameStore.state as StopwatchPausedState;
      expect(state.result).not.toHaveProperty(getController(0).id);
    });

    it('should turn off the LED for a removed controller', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { device } = await initializeStoreWithDevice(buzzer);
      const spy = vi.spyOn(device, 'updateLight');

      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      await wrapper.find(selector('btn-remove-result')).trigger('click');
      // Click twice for confirmation
      // Wrapper needs to be selected again as the element changes
      await wrapper.find(selector('btn-remove-result')).trigger('click');

      expect(spy).toHaveBeenLastCalledWith(0, false);
    });

    it('should transition to preparing when cancel button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('paused');

      const btn = wrapper.find(selector('btn-game-cancel'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });
  });

  describe('completed', () => {
    installFakeTimer();

    const initializeStore = async () => {
      const gameStore = useGameStore();

      gameStore.transition({
        game: 'stopwatch',
        name: 'completed',
        time: 10.1,
        result: {},
      });
      await nextTick();

      return gameStore;
    };

    const initializeStoreWithDevice = async (buzzer: BuzzerApi) => {
      const gameStore = useGameStore();
      const deviceApi = await createDevice(buzzer, 2);

      gameStore.transition({
        game: 'stopwatch',
        name: 'completed',
        time: 10.1,
        result: {
          [deviceApi.getController(0).id]: 5.2,
          [deviceApi.getController(1).id]: undefined,
        },
      });
      await nextTick();

      return {
        gameStore,
        ...deviceApi,
      };
    };

    it('should prevent a button press', async () => {
      const { buzzer } = mountStopwatchPage();

      const { gameStore, getController, pressAndRelease } =
        await initializeStoreWithDevice(buzzer);

      pressAndRelease(0, BuzzerButton.RED);
      pressAndRelease(1, BuzzerButton.RED);

      const state = gameStore.state as StopwatchCompletedState;
      expect(state.result).toHaveProperty(getController(0).id, 5.2);
      expect(state.result).toHaveProperty(getController(1).id, undefined);
    });

    it('should disqualify a controller', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { gameStore, getController } =
        await initializeStoreWithDevice(buzzer);

      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      await wrapper.find(selector('btn-remove-result')).trigger('click');
      // Click twice for confirmation
      // Wrapper needs to be selected again as the element changes
      await wrapper.find(selector('btn-remove-result')).trigger('click');

      const state = gameStore.state as StopwatchPausedState;
      expect(state.result).toHaveProperty(getController(0).id, undefined);
    });

    it('should turn of the LED for a disqualified controller', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { device } = await initializeStoreWithDevice(buzzer);
      const spy = vi.spyOn(device, 'updateLight');

      // Q-Virtual-Scroll uses timers for the animation, so we need to advance them first.
      await vi.advanceTimersByTimeAsync(100);

      await wrapper.find(selector('btn-remove-result')).trigger('click');
      // Click twice for confirmation
      // Wrapper needs to be selected again as the element changes
      await wrapper.find(selector('btn-remove-result')).trigger('click');

      expect(spy).toHaveBeenLastCalledWith(0, false);
    });

    it('should transition to running when quick-play button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('completed');

      const btn = wrapper.find(selector('btn-game-quick-play'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should transition to preparing when restart button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('completed');

      const btn = wrapper.find(selector('btn-game-restart'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });

    describe.todo('scores');
  });
});
