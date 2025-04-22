import { describe, expect, it, vi } from 'vitest';
import { mountPage } from '../utils/mount';
import BuzzerQuestionPage from 'pages/gameModes/BuzzerGamePage.vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { Dialog, type QBtn } from 'quasar';
import { useGameStore } from 'stores/game-store';
import { selector } from '../utils/element-selector';
import { nextTick } from 'vue';
import { createDevice } from '../utils/buzzer';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import type { BuzzerAnsweringState } from 'app/common/gameState/BuzzerState';
import { installFakeTimer } from '../install-timer';
import type { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';
import { useGameSettingsStore } from 'stores/game-settings-store';

const mountBuzzerPage = () => mountPage(BuzzerQuestionPage);

installQuasarPlugin({ plugins: { Dialog } });

describe('BuzzerPage', () => {
  it('should mount component properly', () => {
    const { wrapper } = mountBuzzerPage();
    expect(wrapper.exists()).toBe(true);
  });

  describe('preparing', () => {
    it('should initiate in preparing', () => {
      mountBuzzerPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.game).toBe('buzzer');
      expect(gameStore.state?.name).toBe('preparing');
    });

    it('should reset all buzzers', async () => {
      const { buzzer } = mountBuzzerPage();
      await createDevice(buzzer);
      const gameState = useGameStore();
      // Force another transition as the initial transition already happened here
      gameState.transition({
        game: 'buzzer',
        name: 'running',
        pressedControllers: [],
      });

      const spy = vi.spyOn(buzzer, 'reset');

      gameState.transition({
        game: 'buzzer',
        name: 'preparing',
      });

      expect(spy).toHaveBeenCalledOnce();
    });

    it('should transition to running when start button is pressed', async () => {
      const { wrapper } = mountBuzzerPage();
      const gameStore = useGameStore();

      const btm = wrapper.find(selector('btn-game-start'));
      expect(btm.exists()).toBe(true);
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it.todo('should show the correct amount of controllers');

    describe.todo('settings');
  });

  describe('running', () => {
    const initializeStore = async () => {
      const gameStore = useGameStore();
      gameStore.transition({
        game: 'buzzer',
        name: 'running',
        pressedControllers: [],
      });
      // Wait for changes to apply
      await nextTick();

      return gameStore;
    };

    it('should transition to answering when buzzer is pressed', async () => {
      const { buzzer } = mountBuzzerPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('running');

      pressAndRelease(0, BuzzerButton.RED);

      expect(gameStore.state?.name).toBe('answering');
      expect(gameStore.state).toHaveProperty('controller', getController(0).id);
    });

    it('should turn on the LED on buzzer press', async () => {
      const { buzzer } = mountBuzzerPage();
      const { device, pressAndRelease } = await createDevice(buzzer);
      await initializeStore();

      const spy = vi.spyOn(device, 'updateLight');

      pressAndRelease(0, BuzzerButton.RED);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(0, true);
    });

    it('should set timer to correct time when transitioning to answering', async () => {
      const { buzzer } = mountBuzzerPage();
      const { pressAndRelease } = await createDevice(buzzer);
      const gameStore = await initializeStore();
      const { buzzerSettings } = useGameSettingsStore();

      buzzerSettings.answerTime = 7;
      pressAndRelease(0, BuzzerButton.RED);

      expect(gameStore.state?.name).toBe('answering');
      expect(gameStore.state).toHaveProperty('time', 7);
    });

    it('should add pressed controller to pressed controllers when transitioning to answering', async () => {
      const { buzzer } = mountBuzzerPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const gameStore = useGameStore();
      gameStore.transition({
        game: 'buzzer',
        name: 'running',
        pressedControllers: [getController(0).id],
      });

      pressAndRelease(1, BuzzerButton.RED);

      const state = gameStore.state as BuzzerAnsweringState;
      expect(state.name).toBe('answering');
      expect(state.pressedControllers).toContain(getController(0).id);
      expect(state.pressedControllers).toContain(getController(1).id);
    });

    it('should only accept the RED button', async () => {
      const { buzzer } = mountBuzzerPage();
      const { pressAndRelease } = await createDevice(buzzer);
      const gameStore = await initializeStore();

      pressAndRelease(0, BuzzerButton.BLUE);
      pressAndRelease(0, BuzzerButton.YELLOW);
      pressAndRelease(0, BuzzerButton.GREEN);
      pressAndRelease(0, BuzzerButton.ORANGE);

      expect(gameStore.state?.name).toBe('running');
    });

    it('should not accept pressed controllers without multiple attempts', async () => {
      const { buzzer } = mountBuzzerPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const gameStore = useGameStore();
      const { buzzerSettings } = useGameSettingsStore();

      buzzerSettings.multipleAttempts = false;
      gameStore.transition({
        game: 'buzzer',
        name: 'running',
        pressedControllers: [getController(0).id],
      });
      // Wait for changes to apply
      await nextTick();

      pressAndRelease(0, BuzzerButton.RED);
      expect(gameStore.state?.name).toBe('running');

      pressAndRelease(1, BuzzerButton.RED);

      const state = gameStore.state as BuzzerAnsweringState;
      expect(state.name).toBe('answering');
      expect(state.controller).toBe(getController(1).id);
      expect(state.pressedControllers).toContain(getController(0).id);
    });

    it('should accept pressed controllers with multiple attempts', async () => {
      const { buzzer } = mountBuzzerPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const gameStore = useGameStore();
      const { buzzerSettings } = useGameSettingsStore();

      buzzerSettings.multipleAttempts = true;
      gameStore.transition({
        game: 'buzzer',
        name: 'running',
        pressedControllers: [getController(0).id],
      });
      // Wait for changes to apply
      await nextTick();

      pressAndRelease(0, BuzzerButton.RED);

      const state = gameStore.state as BuzzerAnsweringState;
      expect(state.name).toBe('answering');
      expect(state.controller).toBe(getController(0).id);
    });

    it('should transition to preparing when cancel button is pressed', async () => {
      const { wrapper } = mountBuzzerPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('running');

      const btm = wrapper.find(selector('btn-game-cancel'));
      expect(btm.exists()).toBe(true);
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });
  });

  describe('answering', () => {
    installFakeTimer();

    const initializeStoreWithDevice = async (buzzer: BuzzerApi) => {
      const gameStore = useGameStore();
      const deviceApi = await createDevice(buzzer, 3);

      gameStore.transition({
        game: 'buzzer',
        name: 'answering',
        time: 5,
        controller: deviceApi.getController(0).id,
        pressedControllers: [deviceApi.getController(0).id],
      });
      await nextTick();

      return {
        gameStore,
        ...deviceApi,
      };
    };

    it('should start count down', async () => {
      const { buzzer } = mountBuzzerPage();
      const { gameStore } = await initializeStoreWithDevice(buzzer);

      await vi.advanceTimersByTimeAsync(2000);

      expect(gameStore.state?.name).toBe('answering');
      expect(gameStore.state).toHaveProperty('time', 3);
    });

    it('should not accept another buzzer', async () => {
      const { buzzer } = mountBuzzerPage();
      const { gameStore, getController, pressAndRelease } =
        await initializeStoreWithDevice(buzzer);

      pressAndRelease(1, BuzzerButton.RED);

      expect(gameStore.state?.name).toBe('answering');
      expect(gameStore.state).toHaveProperty('controller', getController(0).id);
    });

    it('should transition to running on reopen', async () => {
      const { wrapper, buzzer } = mountBuzzerPage();
      const { gameStore } = await initializeStoreWithDevice(buzzer);

      const btm = wrapper.find(selector('btn-game-reopen'));
      expect(btm.exists()).toBe(true);
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should turn of all LEDs on reopen', async () => {
      const { buzzer } = mountBuzzerPage();
      const { gameStore } = await initializeStoreWithDevice(buzzer);

      const spy = vi.spyOn(buzzer, 'reset');

      gameStore.transition({
        game: 'buzzer',
        name: 'preparing',
      });

      expect(spy).toHaveBeenCalled();
    });

    it('should disable re-open button when all controllers are pressed', async () => {
      const { wrapper, buzzer } = mountBuzzerPage();
      const gameStore = useGameStore();
      const deviceApi = await createDevice(buzzer, 2);
      gameStore.transition({
        game: 'buzzer',
        name: 'answering',
        time: 5,
        controller: deviceApi.getController(0).id,
        pressedControllers: [
          deviceApi.getController(0).id,
          deviceApi.getController(1).id,
        ],
      });
      await nextTick();

      const buttons = wrapper.findAllComponents<QBtn>(
        selector('btn-game-reopen'),
      );
      expect(buttons.length).toBe(1);
      expect(buttons[0]!.props().disable).toBe(true);
    });

    it('should transition to preparing on restart', async () => {
      const { wrapper, buzzer } = mountBuzzerPage();
      const { gameStore } = await initializeStoreWithDevice(buzzer);

      const btm = wrapper.find(selector('btn-game-restart'));
      expect(btm.exists()).toBe(true);
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });

    it.todo('should transition to answered on points update');

    describe.todo('points');
  });

  describe('answered', () => {
    const initializeStoreWithDevice = async (buzzer: BuzzerApi) => {
      const gameStore = useGameStore();
      const deviceApi = await createDevice(buzzer, 3);

      gameStore.transition({
        game: 'buzzer',
        name: 'answered',
        controller: deviceApi.getController(0).id,
        pressedControllers: [deviceApi.getController(0).id],
        correct: false,
        points: 5,
      });
      await nextTick();

      return {
        gameStore,
        ...deviceApi,
      };
    };

    it('should transition to running on reopen', async () => {
      const { wrapper, buzzer } = mountBuzzerPage();
      const { gameStore } = await initializeStoreWithDevice(buzzer);

      const btm = wrapper.find(selector('btn-game-reopen'));
      expect(btm.exists()).toBe(true);
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should transition to preparing on restart', async () => {
      const { wrapper, buzzer } = mountBuzzerPage();
      const { gameStore } = await initializeStoreWithDevice(buzzer);

      const btm = wrapper.find(selector('btn-game-restart'));
      expect(btm.exists()).toBe(true);
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });

    it('should disable re-open button when all controllers are pressed', async () => {
      const { wrapper, buzzer } = mountBuzzerPage();
      const gameStore = useGameStore();
      const deviceApi = await createDevice(buzzer, 2);
      gameStore.transition({
        game: 'buzzer',
        name: 'answered',
        controller: deviceApi.getController(0).id,
        pressedControllers: [
          deviceApi.getController(0).id,
          deviceApi.getController(1).id,
        ],
        points: 1,
        correct: true,
      });
      await nextTick();

      const buttons = wrapper.findAllComponents<QBtn>(
        selector('btn-game-reopen'),
      );
      expect(buttons.length).toBe(1);
      expect(buttons[0]!.props().disable).toBe(true);
    });

    it.todo('should update the points');

    it.todo('should disable continue button when answer is correct');

    it.todo('should transition to answering and points is de-selected');
  });
});
