import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountPage } from '@/../test/vitest/utils/mount';
import { selector } from '@/../test/vitest/utils/element-selector';
import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import PowerPointPage from '@/pages/PowerPointPage.vue';

installQuasarPlugin();

/**
 * Regression guard for plan section 21.3.
 *
 * PowerPoint does not repaint an embedded add-in during Slide Show unless the
 * page paints. Without this pump every *static* state - waiting for the
 * operator, a final leaderboard, the idle screen - renders blank on the slide,
 * and the failure is silent: it looks exactly like a broken add-in.
 *
 * Phase 0 established, the hard way, that the mutation must cause **layout**.
 * A `transform` or `opacity` tweak is not enough: Chromium re-composites such an
 * element without repainting it, and the add-in stayed blank until clicked.
 *
 * This test exists because the pump looks like dead code and will otherwise be
 * "optimised" into a transform, or deleted outright, by someone reasonably
 * concluding it does nothing.
 */
describe('PowerPoint paint pump', () => {
  let frameCallback: FrameRequestCallback | undefined;

  beforeEach(() => {
    // Stub the Office global so the composable short-circuits instead of
    // appending the CDN <script>. The pump is independent of Office readiness -
    // it must run even when the host never initialises, because that state is
    // rendered on the slide too.
    (globalThis as { Office?: unknown }).Office = {
      onReady: () => new Promise(() => undefined),
    };

    frameCallback = undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frameCallback = cb;
      return 1;
    });
  });

  afterEach(() => {
    delete (globalThis as { Office?: unknown }).Office;
    vi.restoreAllMocks();
  });

  const advance = (frames: number) => {
    for (let i = 0; i < frames; i += 1) {
      const cb = frameCallback;
      frameCallback = undefined;
      cb?.(performance.now());
    }
  };

  it('mounts a paint pump element', () => {
    const { wrapper } = mountPage(PowerPointPage);

    expect(wrapper.find(selector('pp-paint-pump')).exists()).toBe(true);
  });

  it('schedules an animation frame on mount', () => {
    mountPage(PowerPointPage);

    expect(window.requestAnimationFrame).toHaveBeenCalled();
    expect(frameCallback).toBeTypeOf('function');
  });

  it('mutates a layout property, not a composited one', () => {
    const { wrapper } = mountPage(PowerPointPage);
    const pump = wrapper.find(selector('pp-paint-pump')).element as HTMLElement;

    advance(1);

    // `left` triggers layout -> paint -> composite. This is the whole point.
    expect(pump.style.left).not.toBe('');

    // If this ever starts failing because someone moved the pump to a transform,
    // the add-in will silently go blank in Slide Show. Do not "fix" it by
    // relaxing the assertion - see the block comment above.
    expect(pump.style.transform).toBe('');
  });

  it('keeps changing that property across frames', () => {
    const { wrapper } = mountPage(PowerPointPage);
    const pump = wrapper.find(selector('pp-paint-pump')).element as HTMLElement;

    const seen = new Set<string>();
    for (let i = 0; i < 4; i += 1) {
      advance(1);
      seen.add(pump.style.left);
    }

    // A pump that settles on one value stops producing paints.
    expect(seen.size).toBeGreaterThan(1);
  });

  it('keeps pumping indefinitely rather than stopping after a few frames', () => {
    mountPage(PowerPointPage);

    advance(30);

    expect(frameCallback).toBeTypeOf('function');
  });

  it('stops pumping when unmounted', () => {
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const { wrapper } = mountPage(PowerPointPage);

    advance(1);
    wrapper.unmount();

    expect(cancel).toHaveBeenCalled();
  });
});
