import { onMounted, onUnmounted } from 'vue';

export type ShortcutHandler = (event: KeyboardEvent) => void;

/**
 * Single-key shortcuts for the page the host is currently on.
 *
 * Keys are matched case-insensitively against `KeyboardEvent.key`, so use
 * `'1'`, `'g'` or `'Enter'`. Presses with a modifier held are ignored, as are
 * presses while a text field has focus or a dialog is open — a shortcut must
 * never fire behind an open settings dialog.
 */
export function useShortcuts(shortcuts: Record<string, ShortcutHandler>): void {
  const handlers = new Map<string, ShortcutHandler>(
    Object.entries(shortcuts).map(([key, handler]) => [
      key.toLowerCase(),
      handler,
    ]),
  );

  function onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) {
      return;
    }

    if (isTyping() || isDialogOpen()) {
      return;
    }

    const handler = handlers.get(event.key.toLowerCase());
    if (!handler) {
      return;
    }

    event.preventDefault();
    handler(event);
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
  });
}

function isTyping(): boolean {
  const element = document.activeElement;

  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element.isContentEditable) {
    return true;
  }

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
}

function isDialogOpen(): boolean {
  return document.querySelector('.q-dialog') !== null;
}
