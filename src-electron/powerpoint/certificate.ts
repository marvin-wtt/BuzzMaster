import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import log from 'electron-log';
import {
  certificatePath,
  certificatePassword,
} from '@/../src-electron/powerpoint/provisioning';

export interface CertificateMaterial {
  pfx: Buffer;
  passphrase: string;
}

/**
 * Locate the TLS material for the local add-in server.
 *
 * DEVELOPMENT ONLY at present. The certificate is generated and trusted by
 * `integrations/powerpoint/dev-cert.ps1` into the user's own certificate store,
 * which Phase 0 (Q1a) confirmed needs no elevation.
 *
 * Production is deliberately NOT implemented here yet. Plan sections 23.1 and
 * 23.2 spell out what it needs — per-machine generation at install time, key
 * storage with sane ACLs, renewal before silent expiry, regeneration when the
 * trust-store entry disappears, and removal on uninstall — and that is Phase 8.
 *
 * A shared private key shipped in the installer is explicitly ruled out. If this
 * function ever grows a bundled certificate, that is a security bug, not a
 * shortcut.
 */
export function resolveCertificate(
  isDev: boolean,
): CertificateMaterial | undefined {
  if (!isDev) {
    // Provisioned on this machine at startup - never shipped. See
    // provisioning.ts and plan section 23.2.
    const provisioned = certificatePath();

    if (!existsSync(provisioned)) {
      log.warn(
        `PowerPoint server: no provisioned certificate at ${provisioned}. ` +
          'The add-in will be unavailable until provisioning succeeds.',
      );
      return undefined;
    }

    return {
      pfx: readFileSync(provisioned),
      passphrase: certificatePassword(),
    };
  }

  // Dev runs from the repo, so walk up from the compiled main-process file.
  const candidates = [
    path.resolve(process.cwd(), '.certs/localhost.pfx'),
    path.resolve(import.meta.dirname, '../../../.certs/localhost.pfx'),
  ];

  const found = candidates.find((candidate) => existsSync(candidate));

  if (!found) {
    log.warn(
      'PowerPoint server: no development certificate found. Looked in:\n  ' +
        candidates.join('\n  ') +
        '\nGenerate one with: pwsh -File integrations/powerpoint/dev-cert.ps1',
    );
    return undefined;
  }

  return {
    pfx: readFileSync(found),
    passphrase:
      process.env.BUZZMASTER_POWERPOINT_CERT_PASSWORD ?? 'buzzmaster-dev',
  };
}
