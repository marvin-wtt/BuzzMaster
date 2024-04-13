import { afterEach, beforeEach, vi } from 'vitest';

export function installFakeTimer() {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
}
