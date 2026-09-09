import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';

export interface ProvisionResult {
  ok: boolean;
  certificate: 'created' | 'renewed' | 'unchanged' | 'removed';
  registered: string[];
  thumbprint: string | null;
  notAfter: string | null;
  error: string | null;
}

interface ProvisionStore {
  certPassword?: string;
}

/**
 * Created on first use rather than at module load.
 *
 * `new Store()` needs an Electron app to resolve its path, so constructing it
 * eagerly makes merely *importing* this module require a running Electron —
 * which it should not, and which stops the pure helpers here being tested.
 */
let store: Store<ProvisionStore> | undefined;

function getStore(): Store<ProvisionStore> {
  store ??= new Store<ProvisionStore>({ name: 'powerpoint' });
  return store;
}

/** Where the provisioned certificate lives. Per user, under the app's own data. */
export function certificatePath(): string {
  return path.join(app.getPath('userData'), 'powerpoint', 'localhost.pfx');
}

/**
 * Passphrase for the provisioned PFX.
 *
 * Generated per installation rather than hardcoded. It is not much of a secret —
 * it sits beside the file it protects, in a directory only this user can read —
 * but a constant would be a shared value across every install, which is the
 * property plan section 23 rules out for the key itself.
 */
export function certificatePassword(): string {
  const settings = getStore();
  let password = settings.get('certPassword');

  if (!password) {
    password = randomBytes(24).toString('base64url');
    settings.set('certPassword', password);
  }

  return password;
}

function scriptPath(isDev: boolean): string {
  // Packaged: shipped via electron-builder `extraResources`.
  // Development: read straight from the repo.
  return isDev
    ? path.resolve(process.cwd(), 'src-electron/powerpoint/provision.ps1')
    : path.join(process.resourcesPath, 'powerpoint', 'provision.ps1');
}

export function manifestPath(isDev: boolean): string {
  return isDev
    ? path.resolve(process.cwd(), 'integrations/powerpoint/manifest.xml')
    : path.join(process.resourcesPath, 'powerpoint', 'manifest.xml');
}

/**
 * Provision the add-in for the current user: certificate plus manifest
 * registration.
 *
 * Runs at every launch, not only after install, because:
 *
 *  - certificates expire, and a silently expired one breaks the integration
 *    months later with no obvious cause (plan section 23.2);
 *  - a per-machine installer cannot provision per-user state for other users;
 *  - the user may have removed the trust entry or the registry key.
 *
 * It is idempotent and cheap when nothing needs doing, and **never fatal**:
 * BuzzMaster must work normally whether or not PowerPoint is involved (§45).
 *
 * Windows only — the integration is Windows-only by design (§3), and the
 * mechanisms used here have no cross-platform equivalent.
 */
export async function provisionPowerPoint(
  isDev: boolean,
  options: { remove?: boolean } = {},
): Promise<ProvisionResult | undefined> {
  if (process.platform !== 'win32') {
    return undefined;
  }

  const script = scriptPath(isDev);

  if (!existsSync(script)) {
    log.warn(`PowerPoint provisioning skipped: script not found at ${script}`);
    return undefined;
  }

  const args = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    script,
    '-CertPath',
    certificatePath(),
    '-Password',
    certificatePassword(),
    '-ManifestPath',
    manifestPath(isDev),
  ];

  if (isDev) {
    // Development uses the certificate from dev-cert.ps1 for both the Vite dev
    // server and the Electron socket. Only the manifest registration is wanted
    // here.
    args.push('-SkipCertificate');
  }

  if (options.remove) {
    args.push('-Remove');
  }

  return new Promise<ProvisionResult | undefined>((resolve) => {
    execFile(
      'powershell.exe',
      args,
      { windowsHide: true, timeout: 60_000 },
      (error, stdout, stderr) => {
        if (error) {
          log.error(
            `PowerPoint provisioning failed to run: ${error.message} ${stderr}`,
          );
          resolve(undefined);
          return;
        }

        const parsed = parseResult(stdout);

        if (!parsed) {
          log.error(`PowerPoint provisioning returned no result: ${stdout}`);
          resolve(undefined);
          return;
        }

        logResult(parsed);
        resolve(parsed);
      },
    );
  });
}

/**
 * Pull the JSON result line out of the script's output.
 *
 * PowerShell profiles and modules can print banners, so the payload is not
 * necessarily the whole of stdout — take the last line that parses.
 */
export function parseResult(stdout: string): ProvisionResult | undefined {
  const lines = stdout.split(/\r?\n/).filter((line) => line.trim() !== '');

  for (const line of lines.reverse()) {
    try {
      const parsed: unknown = JSON.parse(line);
      if (typeof parsed === 'object' && parsed !== null && 'ok' in parsed) {
        return parsed as ProvisionResult;
      }
    } catch {
      // Not the JSON line; keep looking.
    }
  }

  return undefined;
}

function logResult(result: ProvisionResult): void {
  if (!result.ok) {
    log.error(`PowerPoint provisioning failed: ${result.error ?? 'unknown'}`);
    return;
  }

  if (result.certificate !== 'unchanged') {
    log.info(
      `PowerPoint certificate ${result.certificate} (${result.thumbprint ?? '?'}), valid until ${result.notAfter ?? '?'}`,
    );
  }

  if (result.registered.length > 0) {
    log.info(
      `PowerPoint add-in registered for Office at: ${result.registered.join(', ')}`,
    );
  } else {
    // Office not installed, or its registry layout has moved. Worth saying out
    // loud: this is the R6 failure mode, and it is silent otherwise.
    log.warn(
      'PowerPoint add-in could not be registered: no Office WEF registry key found.',
    );
  }
}
