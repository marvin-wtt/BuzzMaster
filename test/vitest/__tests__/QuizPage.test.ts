import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizQuestionPage from 'pages/questions/QuizQuestionPage.vue';
import { Dialog } from 'quasar';
import { installPinia } from 'app/test/vitest/install-pinia';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useGameStore } from 'stores/game-store';
import { createDevice } from 'app/test/vitest/utils/buzzer';
import { selector } from 'app/test/vitest/utils/element-selector';
import { QuizRunningState } from 'app/common/GameState';
import { mountPage } from 'app/test/vitest/utils/mount-page';
import { installTeleportTarget } from 'app/test/vitest/install-teleport-target';

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
    it.todo('should initiate in preparing');

    it('should start when the start button is pressed', async () => {
      const gameStore = useGameStore();
      const { wrapper } = mountQuizPage();

      expect(gameStore.state?.game).toBe('quiz');

      expect(wrapper.find(selector('btn-game-start')).exists()).to.be.true;
      await wrapper.find(selector('btn-game-start')).trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });
  });

  describe('running', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

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

    describe('answer change never', () => {
      const initializeStore = () => {
        const gameStore = useGameStore();
        gameStore.transition({
          game: 'quiz',
          name: 'running',
          time: 5,
          answerChangeAllowed: 'never',
          result: {},
        });

        return gameStore;
      };

      it('should accept an answer', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getControllerId } = await createDevice(buzzer);
        const gameStore = initializeStore();

        const controllerId = getControllerId(0);

        pressAndRelease(0, BuzzerButton.BLUE);

        expect(gameStore.state).toHaveProperty('result');
        expect((gameStore.state as QuizRunningState).result).toHaveProperty(
          controllerId,
          BuzzerButton.BLUE,
        );
      });

      it.todo('should turn on the LED');

      it('should accept an answer from multiple controllers', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getControllerId } = await createDevice(buzzer);
        const gameStore = initializeStore();

        const controller0Id = getControllerId(0);
        pressAndRelease(0, BuzzerButton.BLUE);

        expect(gameStore.state).toHaveProperty('result');
        expect((gameStore.state as QuizRunningState).result).toHaveProperty(
          controller0Id,
          BuzzerButton.BLUE,
        );

        const controller1Id = getControllerId(1);
        pressAndRelease(1, BuzzerButton.YELLOW);

        expect((gameStore.state as QuizRunningState).result).toHaveProperty(
          controller0Id,
          BuzzerButton.BLUE,
        );
        expect((gameStore.state as QuizRunningState).result).toHaveProperty(
          controller1Id,
          BuzzerButton.YELLOW,
        );
      });

      it('should not accept the red button', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease } = await createDevice(buzzer);
        const gameStore = initializeStore();

        pressAndRelease(0, BuzzerButton.RED);

        expect(gameStore.state).toHaveProperty('result', {});
      });

      it('should prevent answer changes', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getControllerId } = await createDevice(buzzer);
        const gameStore = initializeStore();

        const controllerId = getControllerId(0);

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(0, BuzzerButton.GREEN);

        expect(gameStore.state).toHaveProperty('result', {
          [controllerId]: BuzzerButton.BLUE,
        });
      });

      it('should transition to completed when all controllers are pressed', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease } = await createDevice(buzzer);
        const gameStore = initializeStore();

        // One button pressed
        pressAndRelease(0, BuzzerButton.BLUE);

        expect(gameStore.state?.name).toBe('running');

        pressAndRelease(1, BuzzerButton.BLUE);

        expect(gameStore.state?.name).toBe('completed');
      });
    });

    describe('answer change always', () => {
      const initializeStore = () => {
        const gameStore = useGameStore();
        gameStore.transition({
          game: 'quiz',
          name: 'running',
          time: 5,
          answerChangeAllowed: 'always',
          result: {},
        });

        return gameStore;
      };

      it('should accept an answer', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getControllerId } = await createDevice(buzzer);
        const gameStore = initializeStore();

        const controllerId = getControllerId(0);

        pressAndRelease(0, BuzzerButton.BLUE);

        expect(gameStore.state).toHaveProperty('result');
        expect((gameStore.state as QuizRunningState).result).toHaveProperty(
          controllerId,
          BuzzerButton.BLUE,
        );
      });

      it.todo('should accept an answer from multiple controllers');

      it.todo('should allow answer change');

      it.todo('should accept an answer from multiple controllers');

      it.todo('should stay in running when all controllers are pressed');
    });

    describe('answer change confirm', () => {
      it.todo('should accept a selection');

      it.todo('should accept a red button with selection');

      it.todo('should reject a red button without previous selection');

      it.todo('should not accept an unconfirmed selection as result');
    });
  });

  describe('completed', () => {
    it.todo('should add unanswered controllers to result');

    it.todo('should not accept a buzzer');
  });
});
