// This file will be run before each test file
import { vi } from 'vitest';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (key: string) => key,
  }),
}));
