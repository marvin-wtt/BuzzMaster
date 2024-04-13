import { describe, expect, it } from 'vitest';
import { mountPage } from 'app/test/vitest/utils/mount-page';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { Dialog } from 'quasar';
import { installPinia } from 'app/test/vitest/install-pinia';
import StopwatchQuestionPage from 'pages/questions/StopwatchQuestionPage.vue';

const mountStopwatchPage = () => mountPage(StopwatchQuestionPage);

installQuasarPlugin({ plugins: { Dialog } });
installPinia({ stubActions: false });

describe('StopwatchPage', () => {
  it('should mount component properly', () => {
    const { wrapper } = mountStopwatchPage();
    expect(wrapper.exists()).to.be.true;
  });

  describe.todo('preparing');

  describe.todo('running');

  describe.todo('completed');
});
