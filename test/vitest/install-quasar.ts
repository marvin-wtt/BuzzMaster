import { config } from '@vue/test-utils';
import { Quasar, type QuasarPluginOptions } from 'quasar';
import { beforeAll, afterAll, vi } from 'vitest';
import { ref } from 'vue';

// This file provides utilities for testing Vue components that use Quasar.
// They are copied from @quasar/quasar-app-extension-testing-unit-vitest

export function installQuasarPlugin(options?: Partial<QuasarPluginOptions>) {
  const pluginsBackup = [...(config.global.plugins ?? [])];
  const provideBackup = { ...(config.global.provide ?? {}) };

  beforeAll(() => {
    config.global.plugins.unshift([Quasar, options]);
    config.global.provide = {
      ...config.global.provide,
      ...qLayoutInjections(),
    };
  });

  afterAll(() => {
    config.global.plugins = pluginsBackup;
    config.global.provide = provideBackup;
  });
}

export function qLayoutInjections() {
  return {
    // pageContainerKey
    _q_pc_: true,
    // layoutKey
    _q_l_: {
      header: { size: 0, offset: 0, space: false },
      right: { size: 300, offset: 0, space: false },
      footer: { size: 0, offset: 0, space: false },
      left: { size: 300, offset: 0, space: false },
      isContainer: ref(false),
      view: ref('lHh Lpr lff'),
      rows: ref({ top: 'lHh', middle: 'Lpr', bottom: 'lff' }),
      height: ref(900),
      instances: {},
      update: vi.fn(),
      animate: vi.fn(),
      totalWidth: ref(1200),
      scroll: ref({ position: 0, direction: 'up' }),
      scrollbarWidth: ref(125),
    },
  };
}
