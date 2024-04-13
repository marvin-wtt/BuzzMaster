import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { describe, expect, it, vi } from 'vitest';
import QuizQuestionPage from 'pages/questions/QuizQuestionPage.vue';
import { Dialog } from 'quasar';
import { installPinia } from 'app/test/vitest/install-pinia';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useGameStore } from 'stores/game-store';
import { createDevice } from 'app/test/vitest/utils/buzzer';
import { selector } from 'app/test/vitest/utils/element-selector';
import {
  QuizCompleteState,
  QuizRunningChangeAlwaysState,
  QuizRunningChangeConfirmState,
  QuizRunningChangeNeverState,
  QuizRunningState,
} from 'app/common/GameState';
import { mountPage } from 'app/test/vitest/utils/mount-page';
import { installTeleportTarget } from 'app/test/vitest/install-teleport-target';
import { installFakeTimer } from 'app/test/vitest/install-timer';
import { nextTick } from 'vue';

const mountQuizPage = () => mountPage(QuizQuestionPage);

installQuasarPlugin({ plugins: { Dialog } });
installPinia({ stubActions: false });
installTeleportTarget('navbar-action');

describe('QuizPage', () => {
  it('should mount component properly', () => {
    const { wrapper } = mountQuizPage();
    expect(wrapper.exists()).to.be.true;
  });

  describe('preparing', () => {
    it('should initiate in preparing', () => {
      mountQuizPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.game).toBe('quiz');
      expect(gameStore.state?.name).toBe('preparing');
    });

    it('should transition to running when start button is pressed', async () => {
      const { wrapper } = mountQuizPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.name).toBe('preparing');

      expect(wrapper.find(selector('btn-game-start')).exists()).to.be.true;
      await wrapper.find(selector('btn-game-start')).trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should show the preparing circle', async () => {
      const { wrapper } = mountQuizPage();

      expect(wrapper.find(selector('preparing-circle')).exists()).to.be.true;
    });
  });

  describe('running', () => {
    installFakeTimer();

    it('should count down', async () => {
      mountQuizPage();

      const gameStore = useGameStore();
      gameStore.transition({
        game: 'quiz',
        name: 'running',
        time: 5,
        answerChangeAllowed: 'always',
        result: {},
      });

      await vi.advanceTimersByTimeAsync(2000);

      expect(gameStore.state?.name).toBe('running');
      expect(gameStore.state).toHaveProperty('time', 3);
    });

    it('should show the timer', async () => {
      const { wrapper } = mountQuizPage();

      const gameStore = useGameStore();
      gameStore.transition({
        game: 'quiz',
        name: 'running',
        time: 5,
        answerChangeAllowed: 'always',
        result: {},
      });
      await nextTick();

      expect(wrapper.find(selector('answer-timer')).exists()).to.be.true;
    });

    it('should transition to completed when timer reaches zero', async () => {
      mountQuizPage();
      const gameStore = useGameStore();
      gameStore.transition({
        game: 'quiz',
        name: 'running',
        time: 5,
        answerChangeAllowed: 'always',
        result: {},
      });

      await vi.advanceTimersByTimeAsync(4999);
      expect(gameStore.state?.name).toBe('running');

      await vi.advanceTimersByTimeAsync(1);
      expect(gameStore.state?.name).toBe('completed');
    });

    it('should transition to preparing on cancel', async () => {
      const gameStore = useGameStore();
      const { wrapper } = mountQuizPage();

      gameStore.transition({
        game: 'quiz',
        name: 'running',
        time: 5,
        answerChangeAllowed: 'always',
        result: {},
      });
      await nextTick();

      expect(gameStore.state?.name).toBe('running');

      expect(wrapper.find(selector('btn-game-cancel')).exists()).to.be.true;
      await wrapper.find(selector('btn-game-cancel')).trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });

    describe('answer change never', () => {
      const initializeStore = async () => {
        const gameStore = useGameStore();
        gameStore.transition({
          game: 'quiz',
          name: 'running',
          time: 5,
          answerChangeAllowed: 'never',
          result: {},
        });
        // Wait for changes to apply
        await nextTick();

        return gameStore;
      };

      it('should accept an answer', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.BLUE);

        const state = gameStore.state as QuizRunningState;
        expect(gameStore.state).toHaveProperty('result');
        expect(state.result).toHaveProperty(controllerId, BuzzerButton.BLUE);
      });

      it('should turn on the LED on answer', async () => {
        const { buzzer } = mountQuizPage();
        const { device, pressAndRelease } = await createDevice(buzzer);
        await initializeStore();

        const spy = vi.spyOn(device, 'updateLight');

        pressAndRelease(0, BuzzerButton.BLUE);

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith(0, true);
      });

      it('should accept an answer from multiple controllers', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(1, BuzzerButton.YELLOW);

        const controller0Id = getController(0).id;
        const controller1Id = getController(1).id;
        const state = gameStore.state as QuizRunningChangeNeverState;
        expect(state.result).toHaveProperty(controller0Id, BuzzerButton.BLUE);
        expect(state.result).toHaveProperty(controller1Id, BuzzerButton.YELLOW);
      });

      it('should not accept the red button', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        pressAndRelease(0, BuzzerButton.RED);

        expect(gameStore.state).toHaveProperty('result', {});
      });

      it('should prevent answer changes', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(0, BuzzerButton.GREEN);

        const state = gameStore.state as QuizRunningState;
        expect(state.result).toHaveProperty(controllerId, BuzzerButton.BLUE);
      });

      it('should transition to completed when all controllers are pressed', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        // Second controller pressed
        pressAndRelease(0, BuzzerButton.BLUE);

        expect(gameStore.state?.name).toBe('running');

        // Second controller pressed
        pressAndRelease(1, BuzzerButton.BLUE);

        expect(gameStore.state?.name).toBe('completed');
      });
    });

    describe('answer change always', () => {
      const initializeStore = async () => {
        const gameStore = useGameStore();
        gameStore.transition({
          game: 'quiz',
          name: 'running',
          time: 5,
          answerChangeAllowed: 'always',
          result: {},
        });
        // Wait for changes to apply
        await nextTick();

        return gameStore;
      };

      it('should accept an answer', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.BLUE);

        const state = gameStore.state as QuizRunningState;
        expect(state.result).toHaveProperty(controllerId, BuzzerButton.BLUE);
      });

      it('should accept an answer from multiple controllers', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(1, BuzzerButton.YELLOW);

        const controller0Id = getController(0).id;
        const controller1Id = getController(1).id;
        const state = gameStore.state as QuizRunningChangeAlwaysState;
        expect(state.result).toHaveProperty(controller0Id, BuzzerButton.BLUE);
        expect(state.result).toHaveProperty(controller1Id, BuzzerButton.YELLOW);
      });

      it('should allow answer change', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(0, BuzzerButton.GREEN);

        const state = gameStore.state as QuizRunningState;
        expect(state.result).toHaveProperty(controllerId, BuzzerButton.GREEN);
      });

      it('should not accept the red button', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        pressAndRelease(0, BuzzerButton.RED);

        expect(gameStore.state).toHaveProperty('result', {});
      });

      it('should stay in running when all controllers are pressed', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        // Second controller pressed
        pressAndRelease(0, BuzzerButton.BLUE);

        expect(gameStore.state?.name).toBe('running');

        // Second controller pressed
        pressAndRelease(1, BuzzerButton.BLUE);

        expect(gameStore.state?.name).toBe('running');
      });
    });

    describe('answer change confirm', () => {
      const initializeStore = async () => {
        const gameStore = useGameStore();
        gameStore.transition({
          game: 'quiz',
          name: 'running',
          time: 5,
          answerChangeAllowed: 'confirm',
          result: {},
          unconfirmed: {},
        });
        // Wait for changes to apply
        await nextTick();

        return gameStore;
      };

      it('should accept an answer', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.BLUE);

        const state = gameStore.state as QuizRunningChangeConfirmState;
        expect(state).toHaveProperty('result');
        expect(state.unconfirmed).toHaveProperty(
          controllerId,
          BuzzerButton.BLUE,
        );
      });

      it('should accept an answer from multiple controllers', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(0, BuzzerButton.RED);
        pressAndRelease(1, BuzzerButton.YELLOW);
        pressAndRelease(1, BuzzerButton.RED);

        const controller0Id = getController(0).id;
        const controller1Id = getController(1).id;
        const state = gameStore.state as QuizRunningState;
        expect(state.result).toHaveProperty(controller0Id, BuzzerButton.BLUE);
        expect(state.result).toHaveProperty(controller1Id, BuzzerButton.YELLOW);
      });

      it('should allow am answer change if not confirmed', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(0, BuzzerButton.GREEN);

        const state = gameStore.state as QuizRunningChangeConfirmState;
        expect(state).toHaveProperty('result');
        expect(state.unconfirmed).toHaveProperty(
          controllerId,
          BuzzerButton.GREEN,
        );
      });

      it('should accept a red button after answer', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(0, BuzzerButton.RED);

        const state = gameStore.state as QuizRunningChangeConfirmState;
        expect(state).toHaveProperty('result');
        expect(state.unconfirmed).not.toHaveProperty(controllerId);
        expect(state.result).toHaveProperty(controllerId, BuzzerButton.BLUE);
      });

      it('should turn on the LED on confirm', async () => {
        const { buzzer } = mountQuizPage();
        const { device, pressAndRelease } = await createDevice(buzzer);
        await initializeStore();

        const spy = vi.spyOn(device, 'updateLight');

        pressAndRelease(0, BuzzerButton.BLUE);

        expect(spy).not.toHaveBeenCalled();

        pressAndRelease(0, BuzzerButton.RED);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(0, true);
      });

      it('should reject a red button without previous selection', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.RED);

        const state = gameStore.state as QuizRunningChangeConfirmState;
        expect(state).toHaveProperty('result');
        expect(state.unconfirmed).not.toHaveProperty(controllerId);
        expect(state.result).not.toHaveProperty(controllerId);
      });

      it('should reject an answer after confirmation', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.GREEN);
        pressAndRelease(0, BuzzerButton.RED);
        pressAndRelease(0, BuzzerButton.BLUE);

        const state = gameStore.state as QuizRunningChangeConfirmState;
        expect(state).toHaveProperty('result');
        expect(state.unconfirmed).not.toHaveProperty(controllerId);
        expect(state.result).toHaveProperty(controllerId, BuzzerButton.GREEN);
      });

      it('should not accept an unconfirmed selection as result', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();

        pressAndRelease(0, BuzzerButton.GREEN);
        pressAndRelease(0, BuzzerButton.RED);

        // Controller 1 is not confirmed
        pressAndRelease(0, BuzzerButton.YELLOW);

        await vi.advanceTimersByTimeAsync(5000);

        const controller0Id = getController(0).id;
        const controller1Id = getController(1).id;

        const state = gameStore.state as QuizCompleteState;
        expect(state).toHaveProperty('result');
        expect(state.result).toHaveProperty(controller0Id);
        expect(state.result).not.toHaveProperty(controller1Id);
      });
    });
  });

  describe('completed', () => {
    it.todo('should add unanswered controllers to result');

    it.todo('should not accept a buzzer');

    it.todo('should transition to running on quick-play');

    it.todo('should transition to preparing on reset');

    it.todo('should show the result');

    describe.todo('score');
  });
});
