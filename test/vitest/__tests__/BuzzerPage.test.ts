import { describe, expect, it } from 'vitest';
import { mountPage } from 'app/test/vitest/utils/mount-page';
import BuzzerQuestionPage from 'pages/questions/BuzzerQuestionPage.vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { Dialog } from 'quasar';
import { installPinia } from 'app/test/vitest/install-pinia';

const mountBuzzerPage = () => mountPage(BuzzerQuestionPage);

installQuasarPlugin({ plugins: { Dialog } });
installPinia({ stubActions: false });

describe('BuzzerPage', () => {
  // FIXME Happy-dom currently does not support canvas
  // See https://github.com/capricorn86/happy-dom/issues/241
  it.skip('should mount component properly', () => {
    const { wrapper } = mountBuzzerPage();
    expect(wrapper.exists()).to.be.true;
  });

  describe.todo('preparing');

  describe.todo('running');

  describe.todo('answering');
});