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
  StopwatchPausedState,
  StopwatchRunningState,
} from 'app/common/GameState';
import { createDevice } from 'app/test/vitest/utils/buzzer';
import { BuzzerButton } from 'src/plugins/buzzer/types';

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

    it.todo('should turn on the LED on answer');

    it.todo('should not accept other buttons');

    it.todo('should show the pressed controllers');

    it.todo('should show the correct controller time');

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

    // TODO Stub compoennt
    it.skip('should remove a controller', async () => {
      const { buzzer, wrapper } = mountStopwatchPage();
      const { pressAndRelease, getController } = await createDevice(buzzer, 3);
      const gameStore = await initializeStore(2);

      pressAndRelease(0, BuzzerButton.RED);
      await nextTick();

      const btm = wrapper.find(selector('btn-remove-result'));
      expect(btm.exists()).to.be.true;

      await btm.trigger('click');
      await btm.trigger('click');

      const controller = getController(0);
      const state = gameStore.state as StopwatchRunningState;
      expect(state.result).not.toHaveProperty(controller.id);
    });

    it.todo('should turn of the LED for a removed controller');

    it.todo('should order the result after time');

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

    it.todo('should prevent a button press');

    it('should transition to running when resume button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('paused');

      const btn = wrapper.find(selector('btn-game-resume'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should transition to completed when stop button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('paused');

      const btn = wrapper.find(selector('btn-game-stop'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('completed');
    });

    it.todo(
      'should disqualify all unpressed controllers when stop button is pressed',
    );

    it.todo('should remove a controller');

    it.todo('should turn of the LED for a removed controller');

    it('should transition to preparing when cancel button is pressed', async () => {
      const { wrapper } = mountStopwatchPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('paused');

      const btn = wrapper.find(selector('btn-game-cancel'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });

    it.todo('should resume the timer at the current time');
  });

  describe('completed', () => {
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

    it.todo('should prevent a button press');

    it.todo('should disqualify a controller');

    it.todo('should turn of the LED for a disqualified controller');

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
