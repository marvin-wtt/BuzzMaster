import { afterEach, beforeEach } from 'vitest';

export function installTeleportTarget(id: string): void {
  beforeEach(() => {
    // create teleport target
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  });

  afterEach(() => {
    // clean up
    document.body.innerHTML = '';
  });
}
