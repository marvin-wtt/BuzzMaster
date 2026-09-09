/**
 * Start the Quasar dev server configured for the PowerPoint add-in.
 *
 * Runs in SPA mode, not electron mode, because Quasar hard-disables HTTPS for
 * electron and bex (quasar-config-file.js: `cfg.devServer.https = false`), and
 * Office add-ins must be served over HTTPS.
 *
 * That split is also closer to production: the add-in is served by the Electron
 * *main* process over its own HTTPS origin (plan section 22), never by the
 * renderer's dev server. Run `npm run dev` alongside this for the desktop app.
 *
 * A wrapper rather than an inline env assignment in package.json, because npm
 * runs scripts through cmd.exe on Windows where `VAR=value cmd` is not valid
 * syntax. Avoids adding cross-env as a dependency for one script.
 *
 * See `powerPointDevServer()` in quasar.config.ts for what the flag changes.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

process.env.BUZZMASTER_POWERPOINT = 'true';

// Resolve the CLI's JS entry and run it with the current node binary.
// Spawning `npx.cmd` instead would need `shell: true` on Windows, since Node 20
// refuses to spawn .cmd files directly - and a shell brings quoting problems
// with it for no benefit here.
const require = createRequire(import.meta.url);
const quasarBin = require.resolve('@quasar/cli/bin/quasar.js');

const child = spawn(process.execPath, [quasarBin, 'dev', '-m', 'spa'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
