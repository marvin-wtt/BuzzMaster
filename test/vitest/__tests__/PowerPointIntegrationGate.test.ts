import { describe, expect, it } from 'vitest';
import {
  POWERPOINT_DEV_WS_PORT,
  POWERPOINT_PORT,
  POWERPOINT_STATUS_PATH,
  isAllowedOrigin,
} from '@/../common/powerpoint/PowerPointProtocol';
import {
  POWERPOINT_DEV_WS_PORT as DEV_SERVER_WS_PORT,
  POWERPOINT_PORT as DEV_SERVER_PORT,
} from '@/../scripts/powerpoint-dev-server.mjs';

/**
 * The integration is opt-in and off by default, because enabling it installs a
 * trusted certificate and writes an Office registry entry — real changes to
 * someone's machine, for a feature most BuzzMaster users never touch.
 *
 * These pin the contract the add-in depends on to explain itself when it is off.
 */
describe('integration status endpoint', () => {
  it('is a fixed path both ends agree on', () => {
    expect(POWERPOINT_STATUS_PATH).toBe('/powerpoint/status');
  });

  it('does not collide with the add-in route', () => {
    // The add-in is a hash route (`/#/powerpoint`), so a real path of
    // `/powerpoint/...` cannot shadow it.
    expect(POWERPOINT_STATUS_PATH.startsWith('/#')).toBe(false);
  });
});

/**
 * Turning the integration off must not weaken the origin check for anyone who
 * turns it back on.
 */
describe('origin allowlist is unaffected by the gate', () => {
  it('still accepts the add-in origin', () => {
    expect(isAllowedOrigin('https://localhost:43127')).toBe(true);
  });

  it('still rejects everything else', () => {
    expect(isAllowedOrigin('https://evil.com')).toBe(false);
    expect(isAllowedOrigin('null')).toBe(false);
    expect(isAllowedOrigin(undefined)).toBe(false);
  });
});

/**
 * The dev-server config cannot import the shared TypeScript constants — it runs
 * in Quasar's Node context before any of that is built — so the ports exist in
 * two places. This is the guard against them drifting, which would show up as an
 * add-in that loads but can never reach BuzzMaster.
 */
describe('dev server ports match the shared protocol constants', () => {
  it('serves the add-in on the manifest port', () => {
    expect(DEV_SERVER_PORT).toBe(POWERPOINT_PORT);
  });

  it('proxies to the port Electron listens on in development', () => {
    expect(DEV_SERVER_WS_PORT).toBe(POWERPOINT_DEV_WS_PORT);
  });
});
