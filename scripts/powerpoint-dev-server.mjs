/**
 * Dev-server settings for the PowerPoint add-in.
 *
 * Lives here rather than in `quasar.config.ts` so that file stays about the app
 * rather than about one integration's development setup.
 *
 * Activated by `npm run dev:powerpoint`, which runs SPA mode. It has no effect
 * under `quasar dev -m electron`: Quasar hard-disables `devServer.https` for
 * electron and bex, and Office add-ins must be served over HTTPS. That is the
 * reason the add-in is a second dev command rather than a flag on the first.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Port the add-in is served from.
 *
 * Baked into the add-in manifest as an absolute URL, so it cannot be negotiated
 * at runtime. Sits below the Windows default dynamic port range (49152-65535)
 * so Windows will not hand it out for outbound connections.
 *
 * Must match `POWERPOINT_PORT` in `common/powerpoint/PowerPointProtocol.ts`;
 * `PowerPointIntegrationGate.test.ts` fails if they drift.
 */
export const POWERPOINT_PORT = 43127;

/**
 * Port the Electron process serves the control socket on during development.
 *
 * The Vite dev server owns {@link POWERPOINT_PORT} while developing, so Electron
 * listens here and Vite proxies through — which keeps the add-in on a single
 * same-origin `/ws` in both development and production. Must match
 * `POWERPOINT_DEV_WS_PORT` in `common/powerpoint/PowerPointProtocol.ts`.
 */
export const POWERPOINT_DEV_WS_PORT = 43128;

/**
 * Resolved on use rather than at import.
 *
 * Importing this module should not touch the filesystem: the port constants are
 * read by tests that guard against drift, and doing URL work at module scope
 * makes it unimportable anywhere `import.meta.url` is not a real file URL.
 */
function certificatePath() {
  return fileURLToPath(new URL('../.certs/localhost.pfx', import.meta.url));
}

const ELECTRON_TARGET = `https://127.0.0.1:${POWERPOINT_DEV_WS_PORT}`;

/**
 * `secure: false` relaxes only the *proxy's* own check of a loopback
 * certificate. It has no bearing on what the browser verifies, which is still
 * the real trusted certificate.
 */
const toElectron = { target: ELECTRON_TARGET, secure: false };

/**
 * Extra `devServer` config, or nothing at all when not running for PowerPoint.
 *
 * @returns {Record<string, unknown>}
 */
export function powerPointDevServer() {
  if (process.env.BUZZMASTER_POWERPOINT !== 'true') {
    return {};
  }

  const cert = certificatePath();

  if (!existsSync(cert)) {
    // Failing loudly beats serving plain HTTP that PowerPoint will silently
    // refuse to load.
    throw new Error(
      `PowerPoint dev server requires a certificate at ${cert}.\n` +
        'Create one with: pwsh -File integrations/powerpoint/dev-cert.ps1',
    );
  }

  return {
    // Loopback only. Quasar's dev server otherwise binds 0.0.0.0 and advertises
    // LAN URLs, which would expose the add-in and its control socket to the
    // whole network. Plan §22 is explicit that this must never be 0.0.0.0, and
    // that applies in development too.
    host: '127.0.0.1',
    port: POWERPOINT_PORT,

    // Nothing to see in a browser: this server exists to be loaded by
    // PowerPoint, and the add-in needs an Office host to initialise at all.
    // Opening a tab just yields a page stuck on "Connecting to PowerPoint".
    open: false,

    https: {
      pfx: readFileSync(cert),
      passphrase:
        process.env.BUZZMASTER_POWERPOINT_CERT_PASSWORD ?? 'buzzmaster-dev',
    },

    proxy: {
      // Lets the add-in tell "BuzzMaster is not running" apart from "the
      // integration is switched off" in development too.
      '/powerpoint/status': toElectron,
      '/ws': { ...toElectron, ws: true },
    },
  };
}
