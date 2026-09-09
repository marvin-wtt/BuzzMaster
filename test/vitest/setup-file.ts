// This file will be run before each test file
import { afterEach, vi } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);

vi.mock('vue-i18n', async () => {
  const { ref } = await import('vue');

  // Shared across calls, because components and stores that read the locale
  // must observe writes made by others - `cast-store.updateLocale` follows the
  // desktop app's locale (plan §32), and without a real ref here it throws.
  const locale = ref('en-US');

  return {
    useI18n: () => ({
      t: (key: string) => key,
      d: (key: string) => key,
      locale,
    }),
  };
});
