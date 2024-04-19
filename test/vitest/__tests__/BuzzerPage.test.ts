import { describe, expect, it, vi } from 'vitest';
import { mountPage } from 'app/test/vitest/utils/mount';
import BuzzerQuestionPage from 'pages/questions/BuzzerQuestionPage.vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { Dialog } from 'quasar';
import { useGameStore } from 'stores/game-store';
import { selector } from 'app/test/vitest/utils/element-selector';

const mountBuzzerPage = () => mountPage(BuzzerQuestionPage);

installQuasarPlugin({ plugins: { Dialog } });

describe('BuzzerPage', () => {
  it('should mount component properly', () => {
    const { wrapper } = mountBuzzerPage();
    expect(wrapper.exists()).to.be.true;
  });

  describe('preparing', () => {
    it('should initiate in preparing', () => {
      mountBuzzerPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.game).toBe('buzzer');
      expect(gameStore.state?.name).toBe('preparing');
    });

    it.todo('should reset all buzzers');

    it('should transition to running when start button is pressed', async () => {
      const { wrapper } = mountBuzzerPage();
      const gameStore = useGameStore();

      expect(gameStore.state?.name).toBe('preparing');

      const btm = wrapper.find(selector('btn-game-start'));
      expect(btm.exists()).to.be.true;
      await btm.trigger('click');

      expect(gameStore.state?.name).toBe('running');
    });

    describe.todo('settings');
  });

  describe.todo('running');

  describe.todo('answering');
});
