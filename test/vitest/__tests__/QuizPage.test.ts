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
      it('should prevent answer changes', async () => {
        const { buzzer } = mountQuizPage();
        const { updateButton, getControllerId } = await createDevice(buzzer);

        const gameStore = useGameStore();
        gameStore.transition({
          game: 'quiz',
          name: 'running',
          time: 5,
          answerChangeAllowed: 'never',
          result: {},
        });

        // First button pressed
        const controllerId = getControllerId(0);

        updateButton(0, BuzzerButton.BLUE, true);

        expect(gameStore.state).toHaveProperty('result');
        expect((gameStore.state as QuizRunningState).result).toHaveProperty(
          controllerId,
          BuzzerButton.BLUE,
        );

        // Second button pressed
        updateButton(0, BuzzerButton.GREEN, true);

        expect(gameStore.state).toHaveProperty('result', {
          [controllerId]: BuzzerButton.BLUE,
        });
      });

      it('should transition to completed when all controllers are pressed', async () => {
        const { buzzer } = mountQuizPage();

        const { updateButton } = await createDevice(buzzer);

        const gameStore = useGameStore();
        gameStore.transition({
          game: 'quiz',
          name: 'running',
          time: 5,
          answerChangeAllowed: 'never',
          result: {},
        });

        // One button pressed
        updateButton(0, BuzzerButton.BLUE, true);

        expect(gameStore.state?.name).toBe('running');

        updateButton(1, BuzzerButton.BLUE, true);

        expect(gameStore.state?.name).toBe('completed');
      });
    });
  });

  describe('completed', () => {
    it.todo('should add unanswered controllers to result');
  });
});
