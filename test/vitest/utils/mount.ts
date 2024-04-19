import { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';
import { mount } from '@vue/test-utils';
import { Component } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';

export const mountPage = <T extends Component>(component: T) => {
  const buzzer = new BuzzerApi();

  const wrapper = mount(component, {
    global: {
      provide: {
        buzzer,
      },
      plugins: [
        createTestingPinia({
          stubActions: false,
          createSpy: vi.fn,
        }),
      ],
    },
  });

  return {
    wrapper,
    buzzer,
  };
};

export const mountWithStore = <P extends Parameters<typeof mount>>(
  component: P[0],
) => {
  const wrapper = mount(component, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
          createSpy: vi.fn,
        }),
      ],
    },
  });

  return {
    wrapper,
  };
};
