// This file will be run before each test file
import { afterEach, vi } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
  }),
}));
