# PowerPoint add-in

BuzzMaster's PowerPoint content add-in: configure a game on a slide, prepare it
from Slide Show, and show the live cast in the slide itself.

Windows only, by design — see `plans/PowerPoint-Integration.md` §3.

| File           | Purpose                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `manifest.xml` | The Office add-in manifest. Registered with Office by BuzzMaster itself. |
| `dev-cert.ps1` | Creates and trusts the localhost certificate used in development.        |

The runtime lives elsewhere: `src/pages/PowerPointPage.vue` and
`src/components/powerpoint/` (renderer), `src-electron/powerpoint/` (server and
provisioning), `common/powerpoint/` (shared config and protocol).

## Running it in development

Three things have to be true: a trusted certificate exists, both dev servers are
running, and the integration is switched on.

### 1. Certificate — once per machine

```sh
pwsh -File integrations/powerpoint/dev-cert.ps1
```

Office add-ins must be served over HTTPS. This creates a localhost certificate
and trusts it for the current user. Expect a certificate prompt; there should be
**no** UAC prompt — everything is per-user.

The certificate is written to `.certs/localhost.pfx` (gitignored) and is used by
both the Vite dev server and the Electron socket.

### 2. Both dev servers

```sh
npm run dev              # BuzzMaster; add-in socket on 43128
npm run dev:powerpoint   # SPA over HTTPS on 43127, proxying /ws
```

Two commands, not one: Quasar hard-disables `devServer.https` in electron mode
(`quasar-config-file.js` sets `cfg.devServer.https = false`), and Office add-ins
require HTTPS. The split also mirrors production, where the add-in is served by
the Electron **main** process rather than the renderer's dev server.

### 3. Enable the integration

In BuzzMaster's settings strip, click the **slideshow** icon.

It is **off by default**. Enabling it installs the trusted certificate and writes
the Office registry entry — real changes to the machine, and disproportionate for
users who never open PowerPoint. See §26.7.

Enabling is also what registers `manifest.xml` with Office, under:

```
HKCU\Software\Microsoft\Office\<version>\WEF\Developer\BuzzMaster
```

Office versions are enumerated rather than hardcoded, and filtered to 15.0+
(web add-ins arrived in Office 2013).

### 4. Insert it in PowerPoint

Restart PowerPoint, then **Insert → My Add-ins → SHARED FOLDER → BuzzMaster**.

Recent Microsoft 365 builds moved this: if there is no add-in entry on the
**Insert** tab, look on **Home → Add-ins → More Add-ins**, or use
**File → Get Add-ins**.

A restart is required because Office caches the add-in list at startup —
`HKCU\...\WEF\PowerPoint_..._HasRegistryAddin` is that cache, and it only
refreshes on a cold start.

## If the add-in does not appear

Work down this list; the first two cover most cases.

1. **PowerPoint was not fully closed.** Check the taskbar for other decks.
2. **The integration is switched off.** The registry entry is only written while
   it is enabled.
3. **Registry entry missing.** Check it:
   ```powershell
   Get-ItemProperty 'HKCU:\Software\Microsoft\Office\16.0\WEF\Developer'
   ```
4. **Fall back to a trusted catalog.** If registry sideloading does not work on
   your Office build, share this folder and add it as a catalog:

   ```powershell
   New-SmbShare -Name buzzmaster-addin -Path "<repo>\integrations\powerpoint" -ReadAccess "$env:USERNAME"
   ```

   Then PowerPoint → File → Options → Trust Center → Trust Center Settings →
   Trusted Add-in Catalogs → add `\\localhost\buzzmaster-addin` → tick **Show in
   Menu** → OK → restart PowerPoint.

   Do **not** use `-ReadAccess Everyone`: on a non-English Windows that fails
   with error 1332, because the account name is localised (`Jeder` on German).

## If the add-in loads but does not connect

The element states its own problem (plan §27):

| Message                                  | Meaning                                                 |
| ---------------------------------------- | ------------------------------------------------------- |
| _BuzzMaster isn't running_               | The desktop app is not reachable. Start it.             |
| _PowerPoint integration is switched off_ | BuzzMaster is running; enable it in the settings strip. |
| _requires a different version_           | Protocol mismatch between the deck and this build.      |

## Known constraints

- **The slideshow must not be fully covered by another window.** Chromium stops
  rendering an occluded window, so on a single monitor the slide freezes while
  BuzzMaster has focus. Two monitors without overlap — the real deployment — are
  unaffected. See §21.4.
- **No transparent backgrounds.** PowerPoint does not render content add-ins with
  a see-through background; match the slide's colour instead.
- Office.js is served locally from `public/office-js`, so the add-in works
  offline like the rest of BuzzMaster. See §24.

## Cleaning up

```sh
pwsh -File integrations/powerpoint/dev-cert.ps1 -Remove
```

That removes the development certificate. To remove the manifest registration and
the provisioned certificate, switch the integration off in BuzzMaster, or:

```sh
pwsh -File src-electron/powerpoint/provision.ps1 -CertPath <path> -Password <pw> -ManifestPath <path> -Remove
```
