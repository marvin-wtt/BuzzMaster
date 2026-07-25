import { BuzzerApi } from '@/plugins/buzzer/BuzzerApi';
import { mount } from '@vue/test-utils';
import type { Component } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';

// `@vue/test-utils`' `mount` overloads reject a generic `Component` argument
// under `exactOptionalPropertyTypes`, so the component is cast at the call site.
// This is a type-only workaround limited to the test helpers.
type Mountable = Parameters<typeof mount>[0];

export const mountPage = <T extends Component>(component: T) => {
  const buzzer = new BuzzerApi();

  const wrapper = mount(component as Mountable, {
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

export const mountWithStore = <T extends Component>(component: T) => {
  const wrapper = mount(component as Mountable, {
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
