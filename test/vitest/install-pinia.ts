import { config } from '@vue/test-utils';
import { cloneDeep } from 'lodash-es';
import { beforeAll, afterAll, vi } from 'vitest';
import { createTestingPinia, TestingOptions } from '@pinia/testing';
import { Plugin } from 'vue';

// This does not reset the store after each test
export function installPinia(options?: Partial<TestingOptions>) {
  const globalConfigBackup = cloneDeep(config.global);

  beforeAll(() => {
    config.global.plugins.unshift(
      // This is needed because typescript will complain othwerwise
      // Probably due to this being a monorepo as this same setup inside a test project did work correctly
      createTestingPinia({
        createSpy: vi.fn,
        ...options,
      }) as unknown as Plugin,
    );
  });

  afterAll(() => {
    config.global = globalConfigBackup;
  });
}
