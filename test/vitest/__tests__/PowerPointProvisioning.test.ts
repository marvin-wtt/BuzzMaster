import { describe, expect, it } from 'vitest';
import { parseResult } from '@/../src-electron/powerpoint/provisioning';

/**
 * The provisioning script's result is the only signal the app gets about whether
 * the integration is actually installed for this user. Misreading it means
 * logging success while the add-in is unregistered — the R6 failure mode, which
 * is otherwise silent.
 */
describe('parseResult', () => {
  const success = JSON.stringify({
    ok: true,
    certificate: 'created',
    registered: [
      String.raw`HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\Developer`,
    ],
    thumbprint: 'ABC123',
    notAfter: '2028-09-09T00:00:00.0000000+02:00',
    error: null,
  });

  it('reads a success result', () => {
    const result = parseResult(success);

    expect(result?.ok).toBe(true);
    expect(result?.certificate).toBe('created');
    expect(result?.registered).toHaveLength(1);
  });

  it('reads a failure result', () => {
    const result = parseResult(
      '{"ok":false,"certificate":"unchanged","registered":[],"error":"Manifest not found"}',
    );

    expect(result?.ok).toBe(false);
    expect(result?.error).toContain('Manifest not found');
  });

  it('ignores banner output printed before the payload', () => {
    // PowerShell profiles and module autoloading can print anything at all.
    const result = parseResult(
      `WARNING: module loaded\nSome banner text\n${success}`,
    );

    expect(result?.ok).toBe(true);
  });

  it('ignores trailing blank lines', () => {
    expect(parseResult(`${success}\r\n\r\n`)?.ok).toBe(true);
  });

  it('returns undefined when there is no result at all', () => {
    expect(parseResult('')).toBeUndefined();
    expect(parseResult('not json')).toBeUndefined();
    expect(parseResult('\n\n')).toBeUndefined();
  });

  it('ignores JSON that is not a provisioning result', () => {
    // A bare value or an unrelated object must not be mistaken for success.
    expect(parseResult('{"something":"else"}')).toBeUndefined();
    expect(parseResult('42')).toBeUndefined();
    expect(parseResult('"a string"')).toBeUndefined();
  });

  it('prefers the last result when several are printed', () => {
    const first =
      '{"ok":false,"certificate":"unchanged","registered":[],"error":"old"}';
    const result = parseResult(`${first}\n${success}`);

    expect(result?.ok).toBe(true);
  });
});
