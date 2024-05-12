import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { describe, expect, it, vi } from 'vitest';
import QuizQuestionPage from 'pages/gameModes/QuizGamePage.vue';
import QuizSettingsDialog from 'components/gameModes/quiz/QuizSettingsDialog.vue';
import { Dialog, QBtn, QIcon } from 'quasar';
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
} from 'app/common/gameState/QuizState';
import { mountPage, mountWithStore } from 'app/test/vitest/utils/mount';
import { installTeleportTarget } from 'app/test/vitest/install-teleport-target';
import { installFakeTimer } from 'app/test/vitest/install-timer';
import { nextTick } from 'vue';
import { useGameSettingsStore } from 'stores/game-settings-store';
import QuizResultModeToggle from 'components/gameModes/quiz/QuizResultModeToggle.vue';

const mountQuizPage = () => mountPage(QuizQuestionPage);

installQuasarPlugin({ plugins: { Dialog } });
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

    it('should reset all buzzers', async () => {
      const { buzzer } = mountQuizPage();
      await createDevice(buzzer);
      const gameState = useGameStore();
      // Force another transition as the initial transition already happened here
      gameState.transition({
        game: 'quiz',
        name: 'completed',
        result: {},
      });

      const spy = vi.spyOn(buzzer, 'reset');

      gameState.transition({
        game: 'quiz',
        name: 'preparing',
      });

      expect(spy).toHaveBeenCalledOnce();
    });

    it('should show the preparing circle', async () => {
      const { wrapper } = mountQuizPage();

      expect(wrapper.find(selector('preparing-circle')).exists()).to.be.true;
    });

    it.todo('should show the correct amount of controllers');

    it('should show all enabled buttons', async () => {
      const { wrapper } = mountQuizPage();
      const { quizSettings } = useGameSettingsStore();

      const icons = wrapper.findAllComponents<QIcon>(
        selector('enabled-controllers-icon'),
      );

      const color = (c: string): RegExp => new RegExp(`.*${c}.*`);

      expect(icons.length).toBe(4);

      // Test all combinations
      quizSettings.activeButtons = [BuzzerButton.BLUE, BuzzerButton.GREEN];
      await nextTick();
      expect(icons[0].props().color).to.match(color('blue'));
      expect(icons[1].props().color).to.match(color('grey'));
      expect(icons[2].props().color).to.match(color('green'));
      expect(icons[3].props().color).to.match(color('grey'));

      quizSettings.activeButtons = [BuzzerButton.YELLOW, BuzzerButton.ORANGE];
      await nextTick();
      expect(icons[0].props().color).to.match(color('grey'));
      expect(icons[1].props().color).to.match(color('orange'));
      expect(icons[2].props().color).to.match(color('grey'));
      expect(icons[3].props().color).to.match(color('yellow'));

      quizSettings.activeButtons = [BuzzerButton.BLUE, BuzzerButton.ORANGE];
      await nextTick();
      expect(icons[0].props().color).to.match(color('blue'));
      expect(icons[1].props().color).to.match(color('orange'));
      expect(icons[2].props().color).to.match(color('grey'));
      expect(icons[3].props().color).to.match(color('grey'));
    });

    it('should transition to running when start button is pressed', async () => {
      const { wrapper } = mountQuizPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.name).toBe('preparing');

      const btm = wrapper.find(selector('btn-game-start'));
      expect(btm.exists()).to.be.true;
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should transition to correct change mode when start button is pressed', async () => {
      const { wrapper } = mountQuizPage();
      const gameStore = useGameStore();
      const { quizSettings } = useGameSettingsStore();
      quizSettings.changeMode = 'confirm';

      const btm = wrapper.find(selector('btn-game-start'));
      await btm.trigger('click');

      const state1 = gameStore.state as QuizRunningState;
      expect(state1.answerChangeAllowed).toBe('confirm');
    });

    it('should set timer on correct time', async () => {
      const { wrapper } = mountQuizPage();
      const gameStore = useGameStore();

      const { quizSettings } = useGameSettingsStore();

      const btm = wrapper.find(selector('btn-game-start'));
      expect(btm.exists()).to.be.true;
      await btm.trigger('click');

      const state = gameStore.state as QuizRunningState;
      expect(state.time).toBe(quizSettings.answerTime);
    });

    describe('settings', () => {
      const mountQuizSettingsDialog = () => mountWithStore(QuizSettingsDialog);

      it('should mount dialog properly', () => {
        const { wrapper } = mountQuizSettingsDialog();
        expect(wrapper.exists()).to.be.true;
      });

      it.todo('should set activated buttons');
      it.todo('should set answer mode');
      it.todo('should set result mode');
      it.todo('should set points correct');
      it.todo('should set points wrong');
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

      expect(gameStore.state?.name).toBe('running');
      const btn = wrapper.find(selector('btn-game-cancel'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

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

      it('should only accept an answer from enabled buttons', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();
        const { quizSettings } = useGameSettingsStore();
        quizSettings.activeButtons = [BuzzerButton.ORANGE, BuzzerButton.BLUE];

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.YELLOW);
        const state1 = gameStore.state as QuizRunningChangeNeverState;
        expect(state1.result).not.toHaveProperty(
          controllerId,
          BuzzerButton.ORANGE,
        );

        pressAndRelease(0, BuzzerButton.BLUE);
        const state2 = gameStore.state as QuizRunningChangeNeverState;
        expect(state2.result).toHaveProperty(controllerId, BuzzerButton.BLUE);
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

      it('should only accept an answer from enabled buttons', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();
        const { quizSettings } = useGameSettingsStore();
        quizSettings.activeButtons = [BuzzerButton.ORANGE, BuzzerButton.BLUE];

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.YELLOW);
        const state1 = gameStore.state as QuizRunningChangeAlwaysState;
        expect(state1.result).not.toHaveProperty(
          controllerId,
          BuzzerButton.ORANGE,
        );

        pressAndRelease(0, BuzzerButton.BLUE);
        const state2 = gameStore.state as QuizRunningChangeAlwaysState;
        expect(state2.result).toHaveProperty(controllerId, BuzzerButton.BLUE);
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
        expect(state.unconfirmed).toHaveProperty(
          controllerId,
          BuzzerButton.BLUE,
        );
      });

      it('should only accept an answer from enabled buttons', async () => {
        const { buzzer } = mountQuizPage();
        const { pressAndRelease, getController } = await createDevice(buzzer);
        const gameStore = await initializeStore();
        const { quizSettings } = useGameSettingsStore();
        quizSettings.activeButtons = [BuzzerButton.ORANGE, BuzzerButton.BLUE];

        const controllerId = getController(0).id;

        pressAndRelease(0, BuzzerButton.YELLOW);
        const state1 = gameStore.state as QuizRunningChangeConfirmState;
        expect(state1.unconfirmed).not.toHaveProperty(
          controllerId,
          BuzzerButton.ORANGE,
        );
        pressAndRelease(0, BuzzerButton.RED);
        const state2 = gameStore.state as QuizRunningChangeConfirmState;
        expect(state2.result).not.toHaveProperty(
          controllerId,
          BuzzerButton.ORANGE,
        );

        pressAndRelease(0, BuzzerButton.BLUE);
        pressAndRelease(0, BuzzerButton.RED);
        const state3 = gameStore.state as QuizRunningChangeConfirmState;
        expect(state3.result).toHaveProperty(controllerId, BuzzerButton.BLUE);
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

    describe.todo('sounds', () => {
      it.todo('should play sounds if enabled');
      it.todo('should not play sounds if disabled');
      it.todo('should start countdown beep at right time');
    });
  });

  describe('completed', () => {
    const initializeStore = async () => {
      const gameStore = useGameStore();
      gameStore.transition({
        game: 'quiz',
        name: 'completed',
        result: {},
      });
      // Wait for changes to apply
      await nextTick();

      return gameStore;
    };

    it('should not accept a buzzer', async () => {
      const { buzzer } = mountQuizPage();
      const { pressAndRelease, getController } = await createDevice(buzzer);
      const controller0 = getController(0);
      const controller1 = getController(1);

      const gameStore = useGameStore();
      gameStore.transition({
        game: 'quiz',
        name: 'completed',
        result: {
          [controller0.id]: BuzzerButton.GREEN,
        },
      });
      // Wait for changes to apply
      await nextTick();

      pressAndRelease(0, BuzzerButton.BLUE);
      pressAndRelease(1, BuzzerButton.BLUE);

      const state = gameStore.state as QuizCompleteState;
      expect(state.result).toHaveProperty(controller0.id, BuzzerButton.GREEN);
      expect(state.result).not.toHaveProperty(controller1.id);
    });

    it('should show the result', async () => {
      const { wrapper } = mountQuizPage();
      await initializeStore();

      expect(wrapper.find(selector('result')).exists()).to.be.true;
    });

    it('should transition to preparing on restart', async () => {
      const { wrapper } = mountQuizPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('completed');

      const btn = wrapper.find(selector('btn-game-restart'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('preparing');
    });

    it('should transition to running on quick-play', async () => {
      const { wrapper } = mountQuizPage();
      const gameStore = await initializeStore();

      expect(gameStore.state?.name).toBe('completed');

      const btn = wrapper.find(selector('btn-game-quick-play'));
      expect(btn.exists()).to.be.true;
      await btn.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    it('should toggle the result component on action button', async () => {
      const { wrapper } = mountWithStore(QuizResultModeToggle);
      const { quizSettings } = useGameSettingsStore();

      const initialMode = quizSettings.resultMode;

      const btn = wrapper.findComponent(QBtn);
      expect(btn.exists()).to.be.true;

      await btn.trigger('click');

      expect(quizSettings.resultMode).not.toBe(initialMode);
    });

    describe('result', () => {
      it.todo('should only the correct answer mode');

      describe('bar', () => {
        it.todo('should show the result bar chart');

        it.todo('should only show answers of active buttons');

        it.todo('should group the tables correctly');

        it.todo('should include unanswered controllers');

        it.todo(
          'should not show unanswered controllers section if none are present',
        );
      });

      describe('table', () => {
        it.todo('should show the result table');

        it.todo('should only show answers of active buttons');

        it.todo('should group the controllers correctly');

        it.todo('should include unanswered controllers');

        it.todo(
          'should not show unanswered controllers section if none are present',
        );
      });
    });

    describe.todo('points');
  });
});
