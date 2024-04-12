import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizQuestionPage from 'pages/questions/QuizQuestionPage.vue';
import { Dialog } from 'quasar';
import { installPinia } from 'app/test/vitest/install-pinia';
import { useBuzzer } from 'src/plugins/buzzer';
import { computed } from 'vue';
import { IController } from 'src/plugins/buzzer/types';
import { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';
import { useGameStore } from 'stores/game-store';

installQuasarPlugin({ plugins: { Dialog } });
installPinia({ stubActions: false });

vi.mock('src/plugins/buzzer');

const mockBuzzerApi = () => {
  const buzzerApi = new BuzzerApi();

  const controllers = computed<IController[]>(() => {
    return buzzerApi.dongles
      .flatMap((dongle) => dongle.controllers)
      .filter((controller) => !controller.disabled);
  });

  const api = {
    controllers,
    dongles: buzzerApi.dongles,
    buzzer: buzzerApi,
  };

  vi.mocked(useBuzzer).mockReturnValue(api);

  return buzzerApi;
};

const selector = (name: string) => {
  return `[data-testid=${name}]`;
};

describe('QuizPage', () => {
  it('should mount component properly', () => {
    mockBuzzerApi();

    const wrapper = mount(QuizQuestionPage);
    expect(wrapper.exists()).to.be.true;
  });

  it('should start when the start button is pressed', async () => {
    mockBuzzerApi();

    const gameStore = useGameStore();
    const wrapper = mount(QuizQuestionPage);

    expect(gameStore.state?.game).toBe('quiz');

    expect(wrapper.find(selector('btn-game-start')).exists()).to.be.true;
    await wrapper.find(selector('btn-game-start')).trigger('click');

    expect(gameStore.state?.name).toBe('running');
  });

  describe('running', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should count down', async () => {
      mockBuzzerApi();

      const gameStore = useGameStore();
      mount(QuizQuestionPage);

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
  });
});
