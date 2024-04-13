import { BuzzerApi } from 'src/plugins/buzzer/BuzzerApi';
import { mount } from '@vue/test-utils';
import { Component } from 'vue';

export const mountPage = <T extends Component>(component: T) => {
  const buzzer = new BuzzerApi();

  const wrapper = mount(component, {
    global: {
      provide: {
        buzzer,
      },
    },
  });

  return {
    wrapper,
    buzzer,
  };
};
