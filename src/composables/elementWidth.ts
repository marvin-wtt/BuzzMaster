import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/**
 * Track an element's rendered width.
 *
 * Uses `ResizeObserver` where available and falls back to window resize events,
 * because the add-in also has to work under test environments and older hosts
 * that do not implement it. A missing observer must degrade to a slightly less
 * responsive measurement, never to a crash on a slide.
 */
export function useElementWidth(
  element: Ref<HTMLElement | null>,
): Ref<number | undefined> {
  const width = ref<number | undefined>();

  let observer: ResizeObserver | undefined;

  const measure = () => {
    if (element.value) {
      width.value = element.value.getBoundingClientRect().width;
    }
  };

  onMounted(() => {
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return;
    }

    observer = new ResizeObserver(measure);
    if (element.value) {
      observer.observe(element.value);
    }
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = undefined;
    window.removeEventListener('resize', measure);
  });

  return width;
}
