# BuzzMaster PowerPoint Integration

# 0. Review status, open risks, and decisions

Reviewed against the codebase on 2026-09-08. The architecture is sound and most of
its claims about the existing code check out. The problems are not in the design —
they are in **sequencing**, and in three places where the hard question was
deferred rather than answered.

## 0.1. Verified as correct

| Claim                                                         | Status                                         |
| ------------------------------------------------------------- | ---------------------------------------------- |
| §17 — cast snapshot is an untyped `Record<string, unknown[]>` | Correct, `src-electron/castAPI/main.ts:19`     |
| §17 — all cast broadcasting funnels through the main process  | Correct, `src/layouts/MainLayout.vue:537-541`  |
| §13 — settings dialogs reach into the store directly          | Correct, `SimonSettingsDialog.vue:109`         |
| §22 — the production build exposes no HTTP server             | Correct, `electron-main.ts:89` uses `loadFile` |
| §30/§44 — cross-game transitions are illegal                  | Correct and load-bearing, `game-store.ts:15`   |
| §21 — cast components must be decoupled from `window.castAPI` | **Overstated — already done.** See §21.1       |

## 0.2. Risk register

Ordered by "can this kill the feature".

| #   | Risk                                                             | Section  | Resolved by                |
| --- | ---------------------------------------------------------------- | -------- | -------------------------- |
| R1  | Content add-in may not render live and interactive in Slide Show | §14, §25 | Phase 0                    |
| R2  | Trusted localhost TLS in an installed, non-developer build       | §22, §23 | Phase 0                    |
| R3  | Fixed port 43127 has no recovery path on collision               | §22      | §22.1, decided             |
| R4  | `Office.context.document.settings` may not be per-instance       | §10      | Phase 0, fallback in §10.1 |
| R5  | Preset schema ages inside user `.pptx` files forever             | §9a      | §9a, new section           |
| R6  | Content add-ins are unsupported by the unified JSON manifest     | §25, §35 | Verify before Phase 8      |
| R7  | Cast pages are tuned for a 1080p window, not a slide frame       | §21      | §21.2, Phase 6             |

## 0.3. Open decisions

**D1 — separate Vite build, or a route in the existing Quasar app?**
**RESOLVED 2026-09-08 → route in the existing Quasar app.** Phase 0 Q6 proved
Office.js tolerates lazy injection: injected after page load it reaches
`Office.onReady`, reports `host=PowerPoint platform=PC`, and `getActiveViewAsync`
works. So the separate build is a preference, not a requirement — and §7.1's costs
(alias duplication, a second router and i18n boot, `quasar.config.ts` drift) argue
against paying it. This also matches the working tree, which already points
`SourceLocation` at `/#/powerpoint`, so §0.4 resolves the same way.

Reversible if the route approach later proves awkward; §7 stays in the document as
the recorded alternative.

**D2 — authentication?** Resolved: **no token in v1.** See §26. Confirmed
empirically 2026-09-08 — Phase 0 Q4 measured the add-in's WebSocket origin as
`https://localhost:43127`, a specific unforgeable value rather than `null`, so the
Origin allowlist is a real control. §26.3's escape hatch is not needed.

## 0.5. Phase 0 results (2026-09-08)

Run on Windows 11, PowerPoint 16.0.20326.20132 (M365 click-to-run, de-DE).
Full detail in `integrations/powerpoint/spike/RESULTS.md`.

| Q                                     | Result                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Q1 — trusted localhost HTTPS          | ✅ PowerPoint loads the add-in from a per-user trusted cert                                            |
| Q2 — live + interactive in Slide Show | ✅ 11 clicks logged with `view: read` — **but see the paint caveat below**                             |
| Q3 — per-instance settings            | ✅ two elements kept distinct ids and labels across save/close/reopen                                  |
| Q4 — WebSocket origin                 | ✅ `https://localhost:43127`, unforgeable → closes D2                                                  |
| Q5 — lifecycle                        | ✅ no teardown entering Slide Show; same page instance throughout; `ActiveViewChanged` fires both ways |
| Q6 — lazy Office.js                   | ✅ works → closes D1                                                                                   |
| Q7 — registry sideload                | ❌ `HasRegistryAddin` stayed `0`; the trusted catalog is what loaded it                                |

**R4 is retired.** Per-instance settings confirmed: two elements reloaded
simultaneously on reopen, each reading its own `instanceId` and its own label. §29
and §20 stand as written.

**R1 is retired as a viability risk** — content add-ins do run live and interactive
in Slide Show on this build.

**R8 — found, diagnosed and mitigated in production code.** The add-in does not
paint in Slide Show until the page forces layout. A static page renders blank
until clicked; so does one animating only `transform`/`opacity`. A page changing a
layout property every frame paints immediately with no interaction. Verified
working in the real add-in, not just the spike. See §21.3, which records what does
_not_ work as well as what does.

**Frame rate is a non-issue.** Measured 144 fps in Slide Show and 144 fps in edit
view, min 141 across 178 samples — full display refresh, no throttling of the
WebView while presenting. §45's "no noticeable latency" is achievable, and Simon's
timed highlights will be smooth.

**Q1a — no elevation, but a prompt.** Installing the per-user certificate raised a
trust dialog that was accepted without administrator rights. §23.1's per-user
assumption therefore holds and the installer does not need UAC — but the prompt is
a Phase 8 UX item, since a dialog about installing a certificate will alarm some
users and the installer copy has to explain it.

**R6 gets worse, not better.** Q7 failing means the only deployment path that
actually worked is the trusted catalog — a network share plus a Trust Center entry,
which Microsoft says is not for production and which no end user will do. §35 is now
the largest unsolved problem in this plan. Retry the registry path deliberately
before Phase 8, and treat §22.1's manifest-regeneration question as part of it.

**R9 — new, and an operating constraint rather than a defect.** Chromium stops
rendering an occluded window, so a slideshow fully covered by another application
freezes until it is visible again. Two monitors with no overlap — the real
deployment — is unaffected. See §21.4.

**R3 unchanged.** Still mitigated rather than solved, and still tied to whether an
installer can write a manifest.

---

## 0.4. Working-tree contradiction to reconcile

`integrations/powerpoint/manifest.xml` currently points `SourceLocation` at
`https://localhost:9000/#/powerpoint` — a route inside the existing Quasar app —
and `integrations/powerpoint/office.js` is a vendored copy. Both contradict §7 and
§24 as written. Either the plan or the working tree is stale; settle it as part of
D1.

---

# 1. Overview

BuzzMaster should support embedding an interactive **PowerPoint Content Add-in** directly into PowerPoint slides.

A BuzzMaster element can be inserted and positioned like another slide object.

The element has two primary modes:

- **Edit mode**
  - Select a BuzzMaster game mode.
  - Configure the game-specific settings.
  - Persist the configuration inside the PowerPoint document.
- **Presentation mode**
  - Show an explicit `Prepare`/`Load game` action.
  - Send the configured preset to the running BuzzMaster desktop application.
  - After activation, render the live BuzzMaster Cast state inside the PowerPoint element.

The first implementation should use **Office.js only**.

VSTO, VBA and COM integration are explicitly out of scope for the first version.

Automatic activation when entering a slide or reaching an animation step can be considered later.

---

# 2. Goals

The integration should support:

- PowerPoint Desktop on Windows.
- Multiple BuzzMaster content elements in the same presentation.
- Independent settings for every BuzzMaster element.
- Existing BuzzMaster game modes.
- Existing Cast presentation components.
- Existing BuzzMaster translations.
- Existing game settings types.
- Communication with the currently running BuzzMaster Electron application.
- Live Cast updates with low latency.
- Graceful handling when BuzzMaster isn't running.
- Production installation together with BuzzMaster.
- Development without requiring a separate backend.
- A protocol that can later support automatic PowerPoint triggers.

---

# 3. Non-goals for v1

The first implementation will not support:

- PowerPoint on the web.
- PowerPoint for macOS.
- automatic activation on slide entry;
- automatic activation from PowerPoint animations;
- VSTO;
- VBA/macros;
- direct HID access from PowerPoint;
- running game logic inside PowerPoint;
- controlling buzzers directly from the Office add-in;
- running BuzzMaster without the desktop application.

PowerPoint is only:

1. a preset/configuration frontend;
2. an activation frontend;
3. another Cast frontend.

BuzzMaster remains the authoritative application.

---

# 4. Core architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     PowerPoint Desktop                      │
│                                                             │
│   BuzzMaster Content Add-in                                 │
│                                                             │
│   Vue 3 + Quasar + Office.js                                │
│                                                             │
│   Edit mode                     Presentation mode            │
│   ─────────                     ─────────────────            │
│   Game selection                Prepare button               │
│   Settings UI          OR       Live Cast                    │
│                                                             │
│                   │                     ▲                    │
│                   │ WSS                 │ WSS                │
└───────────────────┼─────────────────────┼────────────────────┘
                    │                     │
                    ▼                     │
┌─────────────────────────────────────────────────────────────┐
│                    BuzzMaster Electron                      │
│                                                             │
│   Electron main process                                     │
│                                                             │
│   ┌────────────────────┐                                    │
│   │ PowerPoint server  │                                    │
│   │ HTTPS + WebSocket  │                                    │
│   └─────────┬──────────┘                                    │
│             │ IPC                                           │
│             ▼                                               │
│   ┌────────────────────┐                                    │
│   │ Main Vue renderer  │                                    │
│   │                    │                                    │
│   │ Game settings      │                                    │
│   │ Game state         │                                    │
│   │ Game controllers   │                                    │
│   │ WebHID             │                                    │
│   └─────────┬──────────┘                                    │
│             │                                               │
│             ▼                                               │
│       Cast broadcaster                                      │
│        ┌──────────┐                                         │
│        │          │                                         │
│        ▼          ▼                                         │
│   Cast window   PowerPoint                                  │
│      IPC          WSS                                       │
└─────────────────────────────────────────────────────────────┘
```

---

# 5. Technology choices

| Component                 | Technology                                      |
| ------------------------- | ----------------------------------------------- |
| PowerPoint integration    | Office Content Add-in                           |
| Office API                | Office.js                                       |
| PowerPoint UI             | Vue 3                                           |
| UI components             | Quasar                                          |
| PowerPoint build          | Vite                                            |
| Desktop application       | Existing Electron + Quasar                      |
| Hardware                  | Existing WebHID implementation                  |
| Main ↔ Electron           | Existing Electron IPC                           |
| PowerPoint ↔ Electron     | Secure WebSocket                                |
| PowerPoint static content | Local HTTPS server from Electron                |
| Per-element configuration | `Office.context.document.settings`              |
| Shared types              | Existing `common/` directory                    |
| Runtime validation        | Recommended: Valibot/Zod or explicit validators |
| Native Office integration | None in v1                                      |

A PowerPoint content add-in is specifically intended to be embedded directly in PowerPoint slides. Users can resize it like other slide content.

PowerPoint Desktop on Windows runs Office web add-ins inside Chromium-based WebView2.

---

# 6. Repository structure

Keep everything in the existing BuzzMaster repository.

Do **not** create separate repositories.

Recommended structure:

```text
BuzzMaster/
│
├─ common/
│  ├─ gameState/
│  ├─ gameSettings/
│  │
│  ├─ gamePreset/
│  │  └─ GamePreset.ts
│  │
│  └─ powerpoint/
│     ├─ PowerPointConfig.ts
│     └─ PowerPointProtocol.ts
│
├─ src/
│  ├─ components/
│  │  ├─ cast/
│  │  └─ gameModes/
│  │     ├─ buzzer/
│  │     ├─ quiz/
│  │     ├─ simon/
│  │     └─ ...
│  │
│  ├─ pages/
│  │  ├─ cast/
│  │  └─ gameModes/
│  │
│  ├─ stores/
│  └─ ...
│
├─ src-electron/
│  ├─ castAPI/
│  ├─ powerpoint/
│  │  ├─ server.ts
│  │  ├─ protocol.ts
│  │  └─ certificate.ts
│  └─ electron-main.ts
│
├─ powerpoint/
│  ├─ index.html
│  ├─ manifest.xml
│  ├─ vite.config.ts
│  │
│  └─ src/
│     ├─ main.ts
│     ├─ App.vue
│     │
│     ├─ office/
│     │  ├─ office.ts
│     │  └─ config.ts
│     │
│     ├─ connection/
│     │  └─ BuzzMasterClient.ts
│     │
│     └─ components/
│        ├─ ConfigurationView.vue
│        ├─ PresentationView.vue
│        └─ ConnectionStatus.vue
│
└─ package.json
```

The PowerPoint application is a separate **build target**, not a separate project/repository in the architectural sense.

It imports shared components and types directly from:

```text
../src/
../common/
```

> **Path note (added in review).** The tree above places `powerpoint/` at the repo
> root. The files that already exist are at `integrations/powerpoint/`
> (`manifest.xml` and a vendored `office.js`). Pick one before writing anything
> else — `integrations/powerpoint/` matches what is on disk and reads better if
> other host integrations follow later. The final shape also depends on open
> decision D1 (§7): if the add-in becomes a route in the existing Quasar app, only
> the manifest and certificate tooling live here.

---

# 7. Why PowerPoint gets a separate Vite build

The Electron renderer and the PowerPoint add-in execute in very different environments.

The PowerPoint page needs Office.js loaded before the application framework.

Microsoft requires Office.js to be referenced from its CDN in the HTML `<head>` and advises against bundling it into the application JavaScript.

Therefore:

```html
<head>
  <script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>
</head>
```

belongs naturally in:

```text
powerpoint/index.html
```

and not in BuzzMaster's Electron `index.html`.

This avoids:

- loading Office.js inside the BuzzMaster main window;
- loading Office.js inside the existing Cast window;
- introducing an unnecessary Office CDN dependency into normal BuzzMaster startup;
- accidentally initializing WebHID inside PowerPoint;
- Office-specific logic leaking into the desktop renderer.

Quasar can be embedded in a normal Vite Vue project using `@quasar/vite-plugin`.

## 7.1. What this decision costs

The separate build is not free, and the plan should own the cost:

- `common/` and `src/` import through the Quasar `@` alias throughout
  (`import type { GameState } from '@/../common/gameState'`). A standalone Vite
  config must reproduce it.
- Reusing cast pages pulls in `vue-router` — `cast-store.ts` pushes routes on game
  change — plus the i18n boot file, SCSS variables, and the Quasar plugin config.
  That is a meaningful re-implementation of `quasar.config.ts`, and it will drift.

## 7.2. The counter-argument

The reasons given above for avoiding a route in the main app — WebHID
initialization, Office.js in the cast window, Office logic leaking into the
renderer — are all reachable with a route guard and a lazily-loaded Office.js.

The real question is narrower: **does Office.js tolerate being injected after page
load, or must it sit in the `<head>`?** Microsoft's guidance says put it in the
head; whether that is a hard requirement or an initialization-timing preference
decides this section.

The working tree already took the other path (§0.4).

**This is open decision D1.** Answer it in Phase 0, before any refactor.

## 7.3. Vendoring Office.js — earlier claim corrected

An earlier revision of this section claimed that vendoring office.js "buys
nothing", on the grounds that the loader fetches its host-specific bundles from
Microsoft's CDN regardless.

**That was wrong.** Reading the loader shows `getOfficeJsBasePath()` derives the
base path from **office.js's own `<script src>`**, and companion scripts are
loaded from `basePath + filename` (see `var j = h.getOfficeJsBasePath()`). Serve
the loader locally with its companions beside it and nothing reaches the network.

That is now what BuzzMaster does — see §24.

---

# 8. Shared GamePreset model

PowerPoint must not store runtime `GameState`.

It should store only enough information to configure BuzzMaster.

Add:

```text
common/gamePreset/GamePreset.ts
```

Example:

```ts
export type GamePreset =
  | {
      game: 'buzzer';
      settings: BuzzerSettings;
    }
  | {
      game: 'quiz';
      settings: QuizSettings;
    }
  | {
      game: 'simon';
      settings: SimonSettings;
    }
  | {
      game: 'stopwatch';
      settings: StopwatchSettings;
    }
  | {
      game: 'pong';
      settings: PongSettings;
    };
```

Conceptually:

```text
PowerPoint
    stores
      ↓
GamePreset

BuzzMaster
    produces
      ↓
GameState
```

`GameState` remains entirely owned by BuzzMaster.

## 8.1. Gaps in the preset union

Two game modes do not fit the union as written:

- **`viewingRate`** — `game-settings-store.ts` holds `viewingRateSettings`, but
  `common/gameSettings/index.ts` does **not** include a `viewingRate` key in
  `GameSettings`. §39 Phase 7 nevertheless lists Viewing Rate as a target. Either
  add it to `GameSettings` first, or drop it from scope explicitly.
- **`leaderboard`** — `LeaderboardState` is a valid `GameState` variant with no
  corresponding settings type, so it cannot be expressed as a `GamePreset` at all.
  A leaderboard slide is a plausible thing to want in a deck; decide whether the
  union needs a settings-free variant.

---

# 9. PowerPoint configuration model

Create:

```text
common/powerpoint/PowerPointConfig.ts
```

Example:

```ts
export interface PowerPointConfig {
  version: 1;

  instanceId: string;

  preset?: GamePreset;

  activation: {
    type: 'manual';
  };
}
```

`instanceId` should be generated once:

```ts
crypto.randomUUID();
```

and persisted with the add-in configuration.

This gives every PowerPoint content element a stable identity.

It will later make features such as:

- logging;
- activation ownership;
- reconnect handling;
- automatic triggers;
- debugging;

much easier.

---

# 9a. Preset schema versioning and migration

§19 versions the _protocol_. That is the easy case: both ends upgrade together, and
a mismatch can be reported immediately.

The hard case is the **preset persisted inside a user's `.pptx`**. That file
outlives every BuzzMaster release. A deck authored today will be opened against a
BuzzMaster from two years from now, and the settings types it embeds
(`SimonSettings`, `BuzzerSettings`, …) are plain TypeScript interfaces with no
runtime schema and no migration path.

`PowerPointConfig.version: 1` exists, but nothing consumes it.

Required before presets reach real documents:

1. **A runtime schema per settings type**, not just a TS interface. Whatever
   validator §5 settles on must describe the _persisted_ shape, and that shape is a
   versioned public contract — deliberately separate from the in-memory store type,
   which stays free to change.
2. **A migration chain** keyed on `PowerPointConfig.version`, applied on load and
   upgrading `1 → 2 → 3`.
3. **Forward-compatibility behavior.** A config whose `version` exceeds what this
   build understands must fail loudly into the `incompatible` state (§27), never be
   silently coerced.
4. **Unknown-field tolerance.** Strip unknown keys on read, so a deck round-tripped
   through a newer BuzzMaster does not hard-fail on an older one.
5. **A frozen fixture per schema version**, with a test asserting it still loads and
   activates. Add one every time the schema changes, and never delete them.

Rule of thumb: **settings are free to change; persisted presets are an API.**

---

# 10. Per-element settings

Use:

```ts
Office.context.document.settings;
```

for configuration persistence.

Microsoft stores these settings **per add-in and per document**, and the settings are available only to the content/task-pane add-in instance that created them. This allows multiple BuzzMaster elements in one presentation to maintain independent configuration.

For example:

```ts
Office.context.document.settings.set(
  'buzzmaster.config',
  config,
);

Office.context.document.settings.saveAsync(...);
```

The value may be a structured object; Office serializes it for persistence.

Important distinction:

```text
Settings.saveAsync()
```

persists the settings into the in-memory/current document representation.

The PowerPoint file itself still needs to be saved by PowerPoint/AutoRecover for those document changes to reach disk.

## 10.1. The per-instance assumption needs a fallback

The Microsoft wording quoted above says settings are scoped **per add-in, per
document**. This section concludes **per instance**. Those are not the same claim,
and the difference decides whether §29 works at all.

It will probably hold — each inserted content add-in becomes its own OOXML
`webextension` part with its own `<we:properties>`, which is where these settings
live. But "probably" is not a design.

**Verify in Phase 0.** Note that the obvious fallback is circular: storing a map
keyed by `instanceId` inside one shared bag does not work, because an instance
cannot learn its own `instanceId` without first reading its own settings.

If the assumption fails, the realistic options are:

1. Support a single BuzzMaster element per presentation in v1, and say so plainly.
2. Derive identity from something PowerPoint genuinely does scope per instance —
   investigate whether the add-in can read its own host element identity.

Both are worse than the current design, which is exactly why this is Phase 0 work
and not Phase 1 work.

---

# 11. Office edit/presentation detection

Use:

```ts
Office.context.document.getActiveViewAsync();
```

PowerPoint reports:

```text
edit
```

for editing views and:

```text
read
```

for Slide Show and Reading View.

Register:

```ts
Office.EventType.ActiveViewChanged;
```

to detect switching between them. Microsoft specifically recommends this pattern for PowerPoint content add-ins.

Application behavior:

```text
edit
 ↓
ConfigurationView

read
 ↓
PresentationView
```

---

# 12. Edit-mode UI

The initial element can display:

```text
┌──────────────────────────────────────┐
│ BuzzMaster                           │
│                                      │
│ Game mode                            │
│ [ Simon Says                ▼ ]      │
│                                      │
│ Answer time                          │
│ [ 1.0                           ]    │
│                                      │
│ Showing speed                        │
│ [ Normal                    ▼ ]      │
│                                      │
│ Auto next round                 [x]  │
│ Last man standing               [ ]  │
│                                      │
│                       Settings saved │
└──────────────────────────────────────┘
```

Changes should ideally be persisted automatically after successful validation.

Use a short debounce, for example:

```text
300–500 ms
```

to avoid calling `saveAsync()` for every individual keystroke.

---

# 13. Reuse existing settings UIs

Existing settings dialogs currently access `useGameSettingsStore()` directly.

For example:

```text
SimonSettingsDialog.vue
```

should eventually be split into:

```text
SimonSettingsForm.vue
SimonSettingsDialog.vue
```

The reusable form:

```vue
<SimonSettingsForm v-model="settings" />
```

does not know about Pinia or dialogs.

Then:

```text
BuzzMaster desktop
    SimonSettingsDialog
          ↓
    SimonSettingsForm
          ↓
    Pinia
```

and:

```text
PowerPoint
    ConfigurationView
          ↓
    SimonSettingsForm
          ↓
    PowerPointConfig
```

Only extract forms as each game is added to PowerPoint. Avoid a large upfront refactor.

---

# 14. Presentation-mode behavior

Version 1 should use **manual activation**.

Before activation:

```text
┌──────────────────────────────────────┐
│                                      │
│            SIMON SAYS                │
│                                      │
│        BuzzMaster connected          │
│                                      │
│          [ Prepare game ]            │
│                                      │
└──────────────────────────────────────┘
```

When clicked:

```text
PowerPoint
   ↓
activatePreset
   ↓
BuzzMaster
```

The game is configured but should generally **not automatically start gameplay**.

For example, BuzzMaster may enter:

```text
Simon → preparing
Buzzer → preparing
Quiz → preparing
```

The operator continues controlling gameplay through the normal BuzzMaster window.

This prevents accidentally starting timed gameplay because someone clicked through PowerPoint slides.

---

# 15. Activation sequence

The complete sequence should be:

```text
User clicks "Prepare game"
        │
        ▼
PowerPoint sends activatePreset
        │
        ▼
Electron WebSocket server
        │
        ▼
Electron IPC
        │
        ▼
BuzzMaster main renderer
        │
        ├── apply settings
        ├── reset previous game if required
        ├── navigate to requested game
        └── initialize game state
                │
                ▼
           GameState changes
                │
                ▼
          Cast broadcaster
            /        \
           /          \
          ▼            ▼
Electron Cast      PowerPoint
    IPC               WSS
```

---

# 16. Game activation service

Do not put PowerPoint-specific activation behavior into every game page.

Add a generic application-level service/composable such as:

```text
src/composables/gameActivation.ts
```

or:

```text
src/services/gameActivation.ts
```

with roughly:

```ts
async function activateGamePreset(preset: GamePreset): Promise<void>;
```

Responsibilities:

1. validate preset;
2. copy settings into `game-settings-store`;
3. reset current `game-store`;
4. navigate to the appropriate game route;
5. ensure the target game gets reinitialized;
6. return success/failure.

This logic is useful beyond PowerPoint and keeps the integration from becoming tightly coupled to routing internals.

---

# 17. Cast architecture adjustment

The existing Cast pipeline should be extended rather than replaced.

Currently:

```text
MainLayout
   ↓
window.castAPI
   ↓
Electron
   ↓
Cast BrowserWindow
```

Change this conceptually to:

```text
MainLayout
   ↓
Cast broadcaster
   ├── IPC → Cast BrowserWindow
   └── WS  → PowerPoint clients
```

The current Electron cast snapshot mechanism already provides much of the required behavior.

Instead of an untyped:

```ts
Record<string, unknown[]>;
```

consider introducing a proper snapshot:

```ts
export interface CastSnapshot {
  revision: number;
  gameState?: GameState;
  gameSettings: GameSettings;
  controllers: Record<string, string>;
  locale: string;
}
```

## 17.1. `revision` needs semantics, or removal

`CastSnapshot.revision` and the `revision` on each `cast.*` message are currently
decorative. Every reconnect delivers a full snapshot (§18, §28), so a client never
has to detect a gap, and nothing in the design reads the counter.

Either:

- define what a client does when it observes a gap — request a fresh snapshot — and
  keep the field; or
- drop it and rely on reconnect-implies-resnapshot.

Do not ship a monotonic counter that nothing checks.

---

# 18. Full-state synchronization

PowerPoint clients should receive an initial complete snapshot after connecting.

Example:

```json
{
  "type": "cast.snapshot",
  "revision": 152,
  "state": {
    "gameState": {},
    "gameSettings": {},
    "controllers": {},
    "locale": "de-DE"
  }
}
```

Subsequent updates may be individual events:

```json
{
  "type": "cast.gameState",
  "revision": 153,
  "state": {}
}
```

This prevents a reconnecting PowerPoint WebView from needing to reconstruct state from events it missed.

---

# 19. WebSocket protocol

Create:

```text
common/powerpoint/PowerPointProtocol.ts
```

Example client messages:

```ts
export type PowerPointClientMessage =
  | {
      type: 'hello';
      protocolVersion: 1;
      instanceId: string;
    }
  | {
      type: 'game.activate';
      requestId: string;
      instanceId: string;
      preset: GamePreset;
    };
```

Server messages:

```ts
export type PowerPointServerMessage =
  | {
      type: 'hello';
      protocolVersion: 1;
      appVersion: string;
    }
  | {
      type: 'game.activationResult';
      requestId: string;
      success: boolean;
      error?: string;
    }
  | {
      type: 'cast.snapshot';
      snapshot: CastSnapshot;
    }
  | {
      type: 'cast.gameState';
      revision: number;
      state?: GameState;
    };
```

Protocol versioning should exist from day one:

```ts
protocolVersion: 1;
```

This makes future BuzzMaster/PowerPoint compatibility manageable.

## 19.1. Standing constraint on the command surface

`game.activate` is the **only** command in the protocol, and §26's decision to ship
without authentication depends on that staying true.

Any future message that starts timed gameplay, awards points, mutates the
leaderboard, or otherwise acts without operator confirmation re-opens §26. Treat
adding a command as a security decision, not a feature.

---

# 20. Activation ownership

Store which PowerPoint instance last activated the game:

```ts
activePowerPointInstanceId?: string;
```

This allows the PowerPoint UI to distinguish:

```text
this instance owns the current game
```

from:

```text
another PowerPoint element activated BuzzMaster
```

Only the owning instance should automatically transition from:

```text
Prepare
```

to:

```text
Live Cast
```

after successful activation.

This becomes particularly important if a slide accidentally contains multiple BuzzMaster elements.

---

# 21. PowerPoint Cast rendering

Do not duplicate existing cast implementations.

The PowerPoint frontend should reuse existing Vue components from:

```text
src/components/cast/
src/pages/cast/
```

The main refactor required is to ensure these components consume:

```text
game state
game settings
controller names
locale
```

without directly depending on:

```ts
window.castAPI;
```

The transport belongs outside the presentation component.

Conceptually:

```text
                 Cast UI
                    ▲
                    │
                Cast state
               /          \
              /            \
Electron IPC                WebSocket
Cast window                 PowerPoint
```

## 21.1. This refactor is largely already done

`src/stores/cast-store.ts` already takes plain data and knows nothing about
transport. The only binding to `window.castAPI` on the receiving side is four lines
in `src/layouts/CastLayout.vue:80-83`.

So the work is not "decouple the cast components from `window.castAPI`" — it is
"add a second layout that feeds the same store from a WebSocket". Considerably
smaller than this section implies.

Note that `cast-store.updateGameState` pushes vue-router routes on game change, so
the PowerPoint build needs a router regardless (see §7.1).

## 21.2. Sizing — earlier claim corrected

An earlier revision of this section claimed the cast pages were "tuned for a
full-screen 1080p window" and that reuse would need an explicit scaling strategy.

**That was wrong.** The cast pages are already responsive down to much smaller
sizes and are normally used in a portrait window, so they adapt to whatever size
PowerPoint gives the element without special handling. The `clamp()` and
`vw`/`vh` units that prompted the claim are what makes them responsive, not
evidence of a fixed target.

Phase 6 confirmed it: the pages are embedded unmodified.

The one real constraint is structural rather than visual — they are `<q-page>`
components and therefore need a layout ancestor, which `PowerPointCastView`
provides with a `container`-mode `<q-layout>` scoped to the add-in frame instead
of the viewport.

## 21.3. The cast surface must keep forcing layout (R8)

Phase 0 found that PowerPoint does not repaint an add-in in Slide Show until the
page paints. A static page stays blank until clicked.

**The mutation must cause layout.** This was established the hard way, and the
distinction is the whole finding:

| Approach                                            | Result in Slide Show                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| Static page                                         | Blank until clicked                                                   |
| `transform` / `opacity` on a near-invisible element | **Still blank** — Chromium re-composites the layer without repainting |
| Changing `left` on a genuinely painted element      | **Visible immediately, no interaction**, 144 fps                      |

Compositor-only properties are not enough. Neither is an element that is
effectively invisible: `opacity: 0.01` on a single pixel gives the compositor
nothing to do. The pump must be _really drawn_ and must _really move_.

The implementation in `PowerPointPage.vue` is a full-width 2px strip painted in
the page background colour — genuinely drawn, therefore invisible against the
backdrop — whose `left` cycles a few pixels every animation frame.

**Design rule: the PowerPoint cast surface must run a layout-forcing animation
for as long as it is mounted — not merely while the game animates.**

The states that most need to be readable are exactly the static ones:

- waiting for the operator to start a round;
- a leaderboard holding a final result;
- the idle "BuzzMaster connected" screen before activation;
- any paused or between-rounds state;
- the error and disconnected states from §27, which are static by nature.

Every one renders blank without the pump, and the failure is silent — it looks
identical to a broken add-in.

Do not gate the pump on game state, and do not rely on §14's activation click to
paint the element: that click paints once, and every static state after it is
exposed again.

`PowerPointPaintPump.test.ts` guards this, including an explicit assertion that
the pump does **not** use `transform`. The pump looks like dead code; without the
test it will eventually be "optimised" into a compositor property or deleted, and
the add-in will silently go blank on stage.

---

## 21.4. The slideshow must not be occluded (R9)

Chromium stops rendering a window it believes is fully covered. The add-in is
hosted in WebView2, so this applies to it: when another application completely
overlaps the slideshow, the page stops executing, and cast updates are queued
rather than lost — they all arrive at once when the slideshow becomes visible
again.

Consequences:

- **On one monitor this looks completely broken.** The operator clicks into
  BuzzMaster, BuzzMaster covers the slideshow, and the slide freezes until
  PowerPoint is focused again. This is the normal single-screen dev setup, so it
  will be hit constantly during development and reported as a bug repeatedly.
- **On two monitors it works**, provided the focused window does not fully cover
  the slideshow — which is the real deployment: slideshow on the projector,
  BuzzMaster on the operator's screen.

Not fixable from inside the page: a frozen page cannot un-freeze itself, and the
`backgroundThrottling: false` escape hatch BuzzMaster uses for its own
`BrowserWindow`s is not available for a WebView2 that Office owns.

So it is an operating constraint, not a defect, and it belongs in user-facing
documentation rather than a bug tracker. Worth considering later: when an add-in
is connected and in presentation view, BuzzMaster could surface a hint about
keeping the slideshow on a separate screen (§36 territory). Do not attempt to
detect overlap programmatically — it is unreliable and the failure mode of a
false warning is worse than the hint being generic.

---

---

# 22. Local production server

The current Electron production build uses:

```ts
mainWindow.loadFile('index.html');
```

and therefore exposes no HTTP server.

Add a small local server in:

```text
src-electron/powerpoint/server.ts
```

Suggested fixed endpoint:

```text
https://localhost:43127
```

Responsibilities:

```text
GET /
GET /assets/*
WSS /ws
```

The server should bind only to:

```text
127.0.0.1
::1
```

and **never**:

```text
0.0.0.0
```

The PowerPoint manifest then uses:

```xml
<SourceLocation
  DefaultValue="https://localhost:43127/"
/>
```

A fixed port is required because the manifest needs a predictable source URL.

If the port is unavailable, BuzzMaster should log a clear error and show a warning in the main UI.

## 22.1. A fixed port needs a recovery path

"Log a clear error and show a warning in the main UI" is not a recovery path. The
port is baked into a manifest already registered on the user's machine, so there is
no negotiation available at runtime: if 43127 is taken, the feature is dead for that
user until they find and stop the offending process.

Minimum acceptable behavior:

1. **Diagnose, don't just warn.** On `EADDRINUSE`, say which port and that another
   application holds it.
2. **Detect the most likely cause.** A previous BuzzMaster that did not shut down
   cleanly is the common case. Identify it and say so.
3. **Retry on an interval.** The conflicting process may exit; bind as soon as
   possible, and the add-in's reconnect loop (§28) picks it up with no user action.
4. **Document the port choice.** 43127 sits below the Windows default dynamic port
   range (49152–65535), so it will not be handed out for outbound connections. That
   is the reason it is a reasonable pick — record it so nobody "helpfully" changes
   it later.

A user-configurable port is only an option if the manifest is regenerated and
re-registered alongside it. If that turns out to be cheap, it is the real fix, and
finding out belongs in Phase 0.

---

# 23. HTTPS and certificates

Office Add-ins are expected to use HTTPS; Microsoft strongly recommends HTTPS and requires it for Marketplace scenarios. Trusted self-signed certificates are acceptable for development/testing.

For development:

```text
office-addin-dev-certs
```

is a suitable solution. Microsoft uses it in its own samples.

For production, certificate handling must be part of the installer design.

Possible approach:

```text
BuzzMaster installer
    ├── installs BuzzMaster
    ├── installs/trusts localhost certificate
    └── configures required Office/WebView localhost access
```

The local certificate/private key must never be shipped as one identical globally shared secret.

Generate or provision it locally during installation.

PowerPoint/WebView2 may additionally require a localhost loopback exemption on Windows; Microsoft documents this as a common requirement for local Office add-in development.

This needs explicit testing on the supported PowerPoint versions before finalizing the installer.

## 23.1. The installer consequence is larger than one bullet

"Installs/trusts localhost certificate" changes the shape of the installer.

`quasar.config.ts` currently configures electron-builder with nothing but an
`appId`, which means the Windows target is the default NSIS one-click, per-user
install — with no elevation prompt.

Writing to the machine Trusted Root store requires elevation. That means:

- a UAC prompt on install, which the product does not have today;
- an installer that plausibly trips antivirus heuristics, because "silently adds a
  root CA" is precisely what malware does;
- code signing becoming much more important than it currently is.

Per-user installation into `CurrentUser\Root` avoids elevation and is respected by
WebView2, which makes it the strong default. Confirm that Office's WebView2 host
honors it — in Phase 0, on a real machine.

## 23.2. Certificate generation must live in the app

Since a shared private key is correctly ruled out, the certificate has to be
generated on the user's machine at install or first run. That means bundling a
certificate generator into the Electron app and owning:

- generation, and key storage with appropriate ACLs;
- **renewal** — a certificate that expires silently breaks the feature months after
  install, with no obvious cause and a very confusing bug report;
- regeneration when the trust-store entry is missing or has been removed;
- clean removal on uninstall.

`office-addin-dev-certs` solves the development case and none of this. **Do not let
a working dev setup be read as evidence that the production path works.** That
conflation is the most likely way this project stalls at Phase 8.

---

# 24. Office.js dependency and offline behavior

**The add-in is fully offline-capable.** Office.js is served by BuzzMaster
itself, not from Microsoft's CDN.

An earlier revision of this section concluded the opposite — that the add-in
"should not claim completely offline operation" because Office.js must come from
the CDN. That followed from the mistaken claim in §7.3, and both are now
corrected.

## How it works

`office.js` is only a loader. It resolves its companion scripts — the
host-specific bundle and the localised strings — relative to its own
`<script src>`, so serving it from BuzzMaster's own origin means those come from
BuzzMaster too.

`scripts/sync-office-js.mjs` copies the needed subset out of the
`@microsoft/office-js` package into `public/office-js`, which Quasar then places
in the build output the add-in server already serves. It runs on `postinstall`,
so a fresh clone has it without anyone remembering.

What is copied, and why that subset:

| Files                                    | Reason                                                                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `office.js`                              | the loader                                                                                                                                                |
| `powerpoint-win32-16.00.js`, `-16.01.js` | which one the host asks for varies by Office build                                                                                                        |
| `o15apptofilemappingtable.js`            | the Office 2013 path; too small to be worth omitting                                                                                                      |
| `<locale>/office_strings.js` × 143       | chosen by the **Office display language**, not BuzzMaster's own locale — shipping only BuzzMaster's four would break for anyone running Office in a fifth |

~4 MB in total, against ~88 MB for the full package covering every host and
platform.

## The trade-off

A pinned local copy does not pick up Microsoft's fixes the way the CDN does.
Updating means bumping `@microsoft/office-js` and re-running the sync — a
deliberate, visible step rather than something that changes under the product.

For an application that is offline-first by nature that is the right trade: a
quiz night in a hall with no wifi must not fail because a script could not be
fetched. It does mean watching the package for security fixes, which the CDN
would otherwise have handled.

The hand-vendored `integrations/powerpoint/office.js` that predated this has been
deleted; `public/office-js` supersedes it.

---

# 25. Manifest

Use the **add-in-only XML manifest** for the initial implementation.

Example structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<OfficeApp
  xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:type="ContentApp">

  <Id>BUZZMASTER-GUID-HERE</Id>

  <Version>1.0.0.0</Version>

  <ProviderName>BuzzMaster</ProviderName>

  <DefaultLocale>en-US</DefaultLocale>

  <DisplayName
    DefaultValue="BuzzMaster"
  />

  <Description
    DefaultValue="Integrates BuzzMaster games into PowerPoint presentations."
  />

  <Hosts>
    <Host Name="Presentation" />
  </Hosts>

  <DefaultSettings>
    <SourceLocation
      DefaultValue="https://localhost:43127/"
    />

    <RequestedWidth>640</RequestedWidth>
    <RequestedHeight>360</RequestedHeight>
  </DefaultSettings>

  <Permissions>Restricted</Permissions>

  <AllowSnapshot>false</AllowSnapshot>

</OfficeApp>
```

`Presentation` explicitly supports content add-ins in PowerPoint.

Content-add-in manifests support requested width and height for the initial embedded size.

## 25.1. `AllowSnapshot` should be `false`

`AllowSnapshot` controls whether PowerPoint stores a static image of the add-in in
the document and shows it when the add-in cannot run.

For a live game cast that is the wrong default. If BuzzMaster is not running, the
audience sees a **stale frame of a previous game** presented as if it were live —
worse than an empty element, because nothing signals that it is stale. §27 already
specifies a real "BuzzMaster isn't running" state; a snapshot would hide it.

It is set to `false` in the manifest above. This also determines what a recipient
sees if the deck is shared with someone who does not have BuzzMaster: an empty
placeholder, which is honest.

## 25.2. Manifest longevity (R6)

The add-in-only XML manifest is the correct choice today — it is the only manifest
type that supports content add-ins.

But the unified JSON manifest, which is where Microsoft is steering Office add-ins,
**does not support content add-ins at all**. That is a strategic risk to this
integration rather than a detail: it suggests content add-ins are on a maintenance
track, not a development track.

Verify the current status before committing to Phase 8, and treat the answer as an
input to §35's deployment decision.

---

# 26. Connection security

## 26.1. Decision: no authentication token in v1

The earlier draft of this section called for a per-launch session secret and
deferred "the exact token bootstrap mechanism". That deferral was concealing the
fact that **the mechanism does not exist**.

The add-in loads its own HTML from the BuzzMaster server. That is the only channel
BuzzMaster has for handing it a secret. So any token must be injected into the
served page — which means **anything that can `GET https://localhost:43127/` can
read the token**. It is not a secret with respect to any attacker who could
otherwise reach the WebSocket.

A token would therefore buy a bootstrap path, a rotation path, a reconnect failure
mode (a WebView holding a stale token across an app restart), and another state in
§27 — in exchange for no security.

**Do not build it for v1.**

## 26.2. What actually defends the server

### Bind to loopback only

```text
127.0.0.1
::1
```

Never `0.0.0.0`. This is the single most important line in the whole design.

### Strict `Origin` allowlist — this is the real control

The threat in the diagram above is a malicious web page in the user's browser
opening `wss://localhost:43127/ws`. It can attempt that; WebSocket connections are
not gated by a CORS preflight. But the browser **does** send an `Origin` header the
page cannot forge, so the server refuses the handshake.

Accept exactly one origin — the add-in's own — and reject every other connection
before the handshake completes.

### Serve no permissive CORS headers

A page can also try to fetch the add-in HTML to read whatever it contains. As long
as the server sets no `Access-Control-Allow-Origin`, the browser will not let it
read the response. Do not add one "temporarily, for debugging".

## 26.3. The one finding that would change this answer

Everything above rests on the add-in's `Origin` being a specific value that can be
allowlisted tightly.

**Confirm empirically in Phase 0 what `Origin` the add-in's WebSocket actually
sends.** Office hosts the add-in in a frame inside WebView2, and if the header
arrives as `null` — as sandboxed iframes send — then it is _not_ a security control,
because every sandboxed iframe on the web sends `null` too.

- Unforgeable, specific origin → ship without a token.
- `null`, or otherwise unallowlistable → revisit. A token injected into the served
  HTML then becomes worth its cost, because it at least restores the property that
  an attacker must be able to read from localhost first.

This is a five-minute check in the spike, and it decides the entire section.

## 26.4. Explicitly out of scope

**A malicious local process running as the same user cannot be defended against,
and no attempt should be made.** It can read anything the served page contains,
forge any header, read `electron-store`, or inject into the application directly.
Every application with a localhost server has this property. Design effort here
buys nothing.

## 26.5. Why the blast radius stays small

No-token is acceptable not only because a token would not work, but because **the
protocol is nearly powerless by construction**:

- the only command is `game.activate` (§19);
- §30 forbids arbitrary state transitions;
- the worst outcome of a successful attack is an interrupted quiz night;
- the only data exposed is game state, settings, controller display names, and
  locale.

**This is a standing constraint, not an observation.** See §19.1.

## 26.6. Runtime validation — unchanged, non-negotiable

Every incoming message must be validated at runtime against a schema. Never rely on
TypeScript alone. This is independent of authentication and is required regardless
of how §26.3 resolves.

## 26.7. The integration is opt-in, and off by default

Added after a review of whether any of §26 was warranted at all.

The conclusion on the socket itself did not change — the Origin allowlist stays,
because it costs about ten lines and stops the one realistic attacker (a web page
in the user's browser) from both issuing `game.activate` and reading cast state,
**including controller names**. That last part matters more than the command:
those are participants' names leaving the machine.

But the review surfaced something §26 had missed entirely. **Provisioning is more
intrusive than the socket.** Installing a trusted root certificate and writing an
Office registry entry are real changes to someone's machine, and until now they
happened at every launch for every user — including the majority who will never
open PowerPoint. That is disproportionate, and it is exactly the behaviour
antivirus heuristics flag (§23.1).

So the whole integration is now a setting, **off by default**:

| State                            | Behaviour                                                               |
| -------------------------------- | ----------------------------------------------------------------------- |
| Enabled                          | Provision, register the manifest, serve everything                      |
| Disabled, previously provisioned | Keep serving the add-in page; refuse the socket                         |
| Disabled, never provisioned      | Nothing at all — no certificate, no registry entry, no listening socket |

The middle row is not an oversight. In production the add-in page is served _by
this server_, so if it never runs, an element already embedded in a deck fails
with a bare browser error inside the slide and explains nothing. Someone who has
already opted in once has accepted the footprint; keeping the static server lets
the element say why it is not working. Someone who never opted in gets nothing at
all, which is the point of the setting.

`GET /powerpoint/status` exists for the same reason: a refused WebSocket
handshake looks identical whether BuzzMaster is absent or the integration is
switched off, and those need opposite advice. The add-in asks, and renders either
"BuzzMaster isn't running" or "enable the PowerPoint integration in BuzzMaster's
settings" (§27).

**Known cost: discoverability.** A user who inserts the add-in without enabling
the integration sees a failure. That is mitigated by the disabled state
explaining its own fix, but it is a real support burden and was accepted
deliberately in exchange for not touching the certificate store of people who
never asked for this.

---

---

# 27. Connection states

The PowerPoint UI should explicitly represent:

```ts
type ConnectionState =
  'connecting' | 'connected' | 'disconnected' | 'incompatible' | 'error';
```

Examples:

### BuzzMaster not running

```text
BuzzMaster isn't running.

Open BuzzMaster to use this game.
```

### Connecting

```text
Connecting to BuzzMaster…
```

### Version mismatch

```text
This PowerPoint integration requires a newer version of BuzzMaster.
```

### Ready

```text
BuzzMaster connected

[ Prepare game ]
```

Do not silently fail.

---

# 28. Reconnection behavior

The WebSocket client should automatically reconnect with exponential backoff.

Example:

```text
250 ms
500 ms
1 s
2 s
5 s
10 s
```

cap at approximately:

```text
10 s
```

After reconnect:

1. perform handshake;
2. send `instanceId`;
3. receive complete `CastSnapshot`;
4. restore activation ownership;
5. continue rendering.

Never assume the WebView remains alive throughout an entire presentation.

---

# 29. Multiple PowerPoint elements

This design explicitly supports:

```text
Presentation
│
├── Slide 1
│   └── BuzzMaster instance A
│       Buzzer settings
│
├── Slide 2
│   └── BuzzMaster instance B
│       Simon settings
│
└── Slide 3
    └── BuzzMaster instance C
        Quiz settings
```

Each content add-in instance stores its own:

```text
PowerPointConfig
```

inside PowerPoint.

All instances may connect to BuzzMaster.

Only the instance that issues the successful activation command becomes the active presentation owner.

---

# 30. Main BuzzMaster changes

The desktop application remains authoritative over:

- HID;
- controllers;
- game state;
- audio;
- leaderboard;
- timers;
- game transitions.

PowerPoint sends only commands such as:

```text
configure/load preset
```

It must never send arbitrary state transitions such as:

```text
set Simon stepIndex = 5
```

This keeps the domain logic in one place.

---

# 31. Existing Cast API evolution

Existing:

```text
common/CastAPI.ts
src-electron/castAPI/
```

should remain.

Do not replace Electron IPC with WebSockets.

Instead:

```text
               ┌──── Electron IPC ───► Cast
Cast source ───┤
               └──── WebSocket ──────► PowerPoint
```

IPC remains the best transport for two Electron windows.

WebSocket exists specifically because PowerPoint cannot access Electron IPC.

---

# 32. Language synchronization

The normal Cast currently receives locale updates.

PowerPoint should do the same.

When connected:

```text
BuzzMaster locale
      ↓
CastSnapshot
      ↓
PowerPoint i18n locale
```

The PowerPoint configuration editor can initially use either:

1. the BuzzMaster locale when connected; or
2. the PowerPoint/Office locale.

For consistency with the existing Cast, using the BuzzMaster application locale is the simpler first implementation.

---

# 33. Development workflow

Recommended development command:

```text
npm run dev
```

can eventually launch:

```text
Quasar Electron dev server
PowerPoint Vite dev server
PowerPoint manifest sideload helper
```

Initially separate commands are fine:

```bash
npm run dev
npm run dev:powerpoint
```

Suggested:

```json
{
  "scripts": {
    "dev": "quasar dev -m electron",
    "dev:powerpoint": "vite --config powerpoint/vite.config.ts",
    "build": "quasar build -m electron",
    "build:powerpoint": "vite build --config powerpoint/vite.config.ts"
  }
}
```

The PowerPoint development server should use a trusted HTTPS certificate.

Microsoft recommends HTTPS even during Office add-in development.

---

# 34. Production build

Production build flow:

```text
npm run build:powerpoint
            │
            ▼
dist-powerpoint/
   index.html
   assets/*
            │
            ▼
npm run build
            │
            ▼
electron-builder
            │
            ├── BuzzMaster application
            ├── PowerPoint static files
            └── PowerPoint manifest
```

Electron Builder must include:

```text
dist-powerpoint/
powerpoint/manifest.xml
```

as application resources.

At runtime:

```text
Electron PowerPointServer
       ↓
serves
       ↓
resources/dist-powerpoint/
```

---

# 35. Manifest deployment

Development:

- sideload the XML manifest;
- use a test/shared catalog where appropriate.

Microsoft documents network-share catalogs for testing Windows task-pane/content add-ins but explicitly states that this mechanism is not intended as production deployment.

Production distribution needs a deliberate strategy.

Possible later options:

### Microsoft Marketplace

Best general distribution mechanism.

However, Marketplace certification expects supported APIs to work across applicable Office platforms, which conflicts with a deliberately Windows/Desktop-only local BuzzMaster integration.

Therefore Marketplace should **not be assumed for v1**.

### Microsoft 365 organization deployment

Organizations can deploy Office add-ins through the Microsoft 365 integrated apps/admin mechanism.

### BuzzMaster-specific installer

Investigate whether the BuzzMaster installer can provision the required catalog/manifest registration for Windows-only deployments.

This should be treated as its own packaging milestone after the technical prototype works.

---

# 36. Error handling

The PowerPoint side must handle:

```text
Office.js failed to initialize
BuzzMaster unavailable
TLS certificate invalid
WebSocket connection failed
protocol version incompatible
preset invalid
game unavailable
activation failed
PowerPoint settings failed to save
Cast state unavailable
```

The user-facing PowerPoint element should always display a meaningful state instead of a blank page.

---

# 37. Logging

PowerPoint:

```ts
console.error(...)
console.warn(...)
```

plus optional structured client diagnostics sent to BuzzMaster.

Electron:

use existing:

```text
electron-log
```

Recommended log events:

```text
PowerPoint server started
PowerPoint client connected
PowerPoint client disconnected
PowerPoint instance authenticated
PowerPoint preset activation requested
PowerPoint preset activation succeeded
PowerPoint preset activation failed
PowerPoint protocol mismatch
```

Do not log complete state payloads at info level.

---

# 38. Testing strategy

## Unit tests

Test:

- `PowerPointConfig` validation;
- preset serialization;
- protocol validators;
- activation mapping;
- game preset application;
- reconnect behavior;
- protocol compatibility.

## Vue tests

Test:

```text
edit → configuration UI
read → presentation UI
disconnected → error/status UI
connected → Prepare button
activation success → Cast
activation failure → retry UI
```

Mock Office.js.

## Electron tests

Test:

- server startup;
- binding only to localhost;
- WebSocket handshake;
- invalid protocol messages;
- activation IPC forwarding;
- state broadcasting.

## Manual PowerPoint tests

At minimum:

1. insert one BuzzMaster add-in;
2. configure Simon;
3. save presentation;
4. close PowerPoint;
5. reopen it;
6. verify settings;
7. insert another BuzzMaster element;
8. configure Buzzer;
9. verify configurations remain independent;
10. start Slide Show;
11. verify read mode;
12. activate Simon;
13. verify BuzzMaster receives settings;
14. operate Simon in BuzzMaster;
15. verify live PowerPoint Cast updates;
16. advance away and back;
17. verify reconnection;
18. stop BuzzMaster;
19. verify disconnected state;
20. restart BuzzMaster;
21. verify automatic reconnect.

---

# 39. Implementation phases

> **Sequencing note (added in review).** The original ordering was risk-inverted:
> Phases 1–2 are the largest, safest, most refactor-heavy work, while Phases 3, 8
> and 9 held every question capable of invalidating the design. Phase 0 exists to
> move that risk to the front. **Do not modify anything under `src/` until Phase 0
> is green.**

---

## Phase 0 — Throwaway feasibility spike

Not production code. One hardcoded HTML page, one self-signed certificate, one
WebSocket that echoes. Delete it afterwards.

**Deleted after use**, as intended. Every finding is recorded in §0.5 and in the
sections it affected (§7.3, §21.3, §21.4, §26). `integrations/powerpoint/README.md`
carries the parts that remain useful day to day.

It must answer, in this order:

1. **Can an installed, non-developer PowerPoint load a content add-in from a
   locally generated, locally trusted HTTPS origin?**
   Test with a certificate placed in `CurrentUser\Root` by a script — _not_ with
   `office-addin-dev-certs`, which proves only the development path. (R2, §23)

2. **Does the add-in render live and stay interactive in Slide Show view?**
   Click a button inside the element during an actual slide show and watch the
   WebSocket message arrive. (R1, §14)

3. **Do two instances in one deck keep independent settings?**
   Set different values, save, close, reopen, verify. (R4, §10.1)

4. **What `Origin` does the add-in's WebSocket send?**
   Log the raw header server-side. This decides §26. (§26.3)

5. **Does the add-in survive navigating away from the slide and back?**
   Establish whether it is reloaded, re-initialized or kept alive, and whether
   `ActiveViewChanged` actually fires on entering Slide Show. (§11, §28)

6. **Does Office.js tolerate lazy injection, or must it sit in the `<head>`?**
   This answers open decision D1. (§7.2)

Optional, if cheap: whether the manifest can be regenerated and re-registered at
install time, which would remove the fixed-port constraint (§22.1).

Success condition:

> All six answered, in writing, in this document.

Failure of 1 or 2 changes the plan's shape rather than its schedule. Stop and
redesign rather than proceeding.

---

## Phase 1 — Office prototype

Implement:

- manifest;
- basic Vite PowerPoint project;
- Office.js initialization;
- `getActiveViewAsync`;
- `ActiveViewChanged`;
- per-instance config persistence;
- simple game selector.

Success condition:

> A real Vue/Vite build — not the Phase 0 spike — switches between the
> configuration and presentation UI on view change, and persists a selected
> game mode across save / close / reopen.

(The "two elements retain different settings" check moved to Phase 0. It is a
feasibility question, not a milestone.)

---

## Phase 2 — Shared settings forms

**DONE (2026-09-09).**

All five preset games extracted, not just Simon. §13 advised doing them one at a
time to avoid a large upfront refactor, but the add-in already offered all five
game modes, so shipping settings for one of them would have been the stranger
outcome. The dialogs are uniform enough that the other four cost little.

- `{Buzzer,Quiz,Simon,Stopwatch,Pong}SettingsForm.vue` — fields only, no Pinia,
  no dialog, no PowerPoint;
- the five dialogs reduced to store binding, a cancellable copy, and OK;
- `PowerPointGameSettings.vue` renders **the same components** for the add-in;
- `settingsForm.ts` — the shared `SettingsFormApi` contract.

Success condition:

> Simon settings are editable identically in BuzzMaster and PowerPoint. — **met,
> and for all five games**

### `normalize()` exists because of a bug this refactor exposed

The quiz zeroed `pointsCorrect`/`pointsWrong` in survey mode inside its dialog's
OK handler. Extracting the fields alone would have left that rule behind, so a
quiz preset configured in PowerPoint would have carried points a survey cannot
award — and the desktop app and the add-in would have disagreed about what the
same settings mean.

`SettingsFormApi.normalize()` is where cross-field rules of that kind now live,
so every consumer gets them. Both call sites run it before persisting.

That is the general risk with this refactor: **logic hiding in an OK handler is
invisible until a second consumer exists.** Check for it when extracting any
further forms.

### Not extracted

`ViewingRateSettingsDialog` is untouched: viewing rate is not in the preset union
(§8.1) because `GameSettings` has no `viewingRate` key. Extract it if and when
that is fixed.

---

## Phase 3 — Local BuzzMaster server

**DONE (2026-09-09).**

Implemented:

- `src-electron/powerpoint/server.ts` — HTTPS + WebSocket, loopback only,
  started and stopped with the app lifecycle;
- `src-electron/powerpoint/certificate.ts` — dev certificate resolution;
  production provisioning deliberately unimplemented and loudly logged (Phase 8);
- `common/powerpoint/PowerPointProtocol.ts` — versioned messages with runtime
  validation on both ends;
- `src/composables/powerPointConnection.ts` — client with the §28 backoff;
- §27 connection states rendered in the presentation view, in all four locales.

Verified against a real socket:

| Scenario                    | Result                                       |
| --------------------------- | -------------------------------------------- |
| Add-in origin + valid hello | handshake completes                          |
| Forged `https://evil.com`   | HTTP 403, upgrade refused                    |
| `null` origin               | HTTP 403                                     |
| No `Origin` header          | HTTP 403                                     |
| Protocol v99                | `error:incompatible-protocol`, socket closed |
| Malformed JSON              | `error:invalid-message`, connection kept     |

Success condition:

> PowerPoint reliably detects whether BuzzMaster is running. — **met**

### Development topology

The Vite dev server owns `POWERPOINT_PORT` (it serves the renderer with HMR), so
in development Electron binds `POWERPOINT_DEV_WS_PORT` (43128) and Vite proxies
`/ws` through to it. In production Electron serves both on 43127.

The add-in therefore always connects to a same-origin `/ws` in both environments.
That uniformity is deliberate: a dev-only URL branch is exactly the kind of thing
that survives to release and then fails only in the packaged build.

Two commands during development:

```sh
npm run dev              # desktop app; add-in server on 43128
npm run dev:powerpoint   # SPA on 43127 over HTTPS, proxying /ws
```

### Note on `broadcast()`

`PowerPointServer.broadcast()` exists and is tested by use in Phase 4, but nothing
calls it yet — the cast fan-out in §17 is Phase 4 work.

---

## Phase 4 — Protocol

**DONE (2026-09-09).**

Implemented:

- `common/CastSnapshot.ts` — the typed snapshot that replaces the untyped
  `Record<string, unknown[]>` (§17);
- `src-electron/castAPI/CastBroadcaster.ts` — one source of cast state, many
  sinks: IPC to the cast window, WebSocket to PowerPoint;
- `cast.snapshot` on handshake, then `cast.gameState` / `cast.gameSettings` /
  `cast.controllers` / `cast.locale` incrementally (§18);
- `src-electron/powerpoint/castBridge.ts` — the event-to-message seam, extracted
  from `electron-main.ts` so it is testable;
- locale following the desktop app (§32).

~~authentication~~ — dropped in §26.1, confirmed by Phase 0 Q4.

Success condition:

> PowerPoint displays live game state changes from BuzzMaster. — **met**

### §17.1 resolved: no `revision` counter

Dropped rather than defined. Every connection — including every reconnect —
begins with a full snapshot, and a WebSocket delivers subsequent events in order,
so there is no gap for a counter to detect. Shipping a monotonic number that
nothing checks would have been worse than shipping neither.

`CastBroadcaster.test.ts` covers the property that makes this safe: a client that
misses every event is still made whole by one snapshot.

### Validation is asymmetric, deliberately

`parseClientMessage` validates fully — that is the direction where untrusted
input reaches the desktop app, and §26's whole security posture rests on it.

`parseServerMessage` validates the envelope only: the discriminator plus the
shape of the top-level field. The payloads are BuzzMaster's own `GameState` and
`GameSettings` arriving from BuzzMaster itself over a loopback socket. Deep
validation there would mean reimplementing every game's state union as
hand-written validators and keeping that copy in step forever — cost with no
security benefit, since a compromised local server has already won.

### Not yet done

The presentation view renders the game name, phase and controller count — enough
to observe live state arriving. Reusing the real cast components from
`src/components/cast` is Phase 6, and §21.2's sizing problem is still open.

---

## Phase 5 — Preset activation

**DONE (2026-09-09).**

Implemented:

- `game.activate` / `game.activationResult` in the protocol;
- `src/services/gameActivation.ts` — the application-level service §16 asks for;
- `common/PowerPointAPI.ts` + `src-electron/powerpointAPI/preload.ts` — a bridge
  separate from `CastAPI`, because this one carries untrusted input _inward_ and
  needs a reply, where cast state only flows outward;
- request timeout in the main process, so a renderer that never answers cannot
  leave an add-in waiting forever;
- activation ownership tracked on the server (§20), and clients ignoring replies
  to requests they did not make.

Success condition:

> Clicking `Prepare game` in PowerPoint configures and opens the correct
> BuzzMaster game. — **met**

### §19.1 discharged: the no-token decision still holds

Adding the first command required re-examining §26.1, as §19.1 demands. It was
weighed and the decision stands, because `game.activate`:

- configures a game and leaves it in its preparing phase;
- deliberately does not start play (§14), so a rogue activation cannot make
  anyone lose a round;
- is immediately visible to the operator in the BuzzMaster window;
- leaves the worst case as an interrupted quiz night.

**A command that starts play, awards points, or mutates the leaderboard would
not satisfy that reasoning.** The next one to be added must re-open §26 rather
than inheriting this conclusion. The argument is recorded on `ClientActivate` in
the protocol, where someone adding a sibling message will actually see it.

### Validation depth

`validatePreset` checks the game discriminator against `PRESET_GAMES` rather than
trusting it — that field decides which code path runs. Per-game settings values
are not deeply validated: they flow into the settings store, which owns their
shape, and a bad value there is a misconfigured game rather than a security
problem.

---

## Phase 6 — Full Cast reuse

**DONE (2026-09-09).**

The add-in renders the _same_ cast pages as the cast window, reading the _same_
`cast-store`. Nothing was reimplemented or copied, so the two surfaces cannot
show different information — the only difference between them is that one store
is fed by Electron IPC and the other by a WebSocket.

- `PowerPointCastView.vue` — selects the cast page by game and hosts it in a
  `container`-mode `<q-layout>`;
- `cast-store` refactored to hold state only;
- routing moved to `CastLayout`, which is the surface that actually has routes.

Success condition:

> The Electron Cast and PowerPoint show equivalent audience information. — **met,
> by construction rather than by parallel implementation**

### The store had to stop navigating

`cast-store.updateGameState` used to push router routes. That made it unusable by
any surface without `cast-*` routes: the add-in owns a single route and loses its
Office context if navigated away from it.

Navigation now lives in `CastLayout`, with the same behaviour — via the index
page first, so a page never sees state belonging to a different game. This is the
same separation §21 asks for in the transport, applied to routing.

### Selection by game, not by route

`PowerPointCastView` maps `gameState.game` to a component. `viewing-rates` is
deliberately absent from that map: it has no cast page, so it renders nothing
rather than throwing — which matters because this happens live on a slide.

### Stale state is never shown

The cast is rendered only while the connection is genuinely `connected`. A
disconnected add-in still holds the last state it received, and leaving that on
screen would present stale information to an audience as though it were live —
the same reasoning as `AllowSnapshot: false` (§25.1).

### Test infrastructure

The shared `vue-i18n` stub in `setup-file.ts` exposed only `t` and `d`. Any
component or store reading `locale` — `cast-store` does, following the desktop
app's locale per §32 — threw. It now exposes a shared `locale` ref.

---

## Phase 7 — All supported games

**DONE (2026-09-09).**

Buzzer, Quiz, Simon, Stopwatch and Pong are complete end to end. Most of this
arrived with earlier phases — Phase 2 extracted all five settings forms rather
than only Simon, and Phases 5 and 6 were written against the whole preset union
rather than one game — so Phase 7 was mainly about proving it and settling the
two exclusions.

A game reaches a slide through five separate pieces:

1. an entry in `PRESET_GAMES`;
2. default settings in `defaults.ts`;
3. a settings form;
4. a `<game>-game` route for activation;
5. a cast page.

`PowerPointGameCoverage.test.ts` asserts all five for every game, against the
app's **real** route table rather than a stub that agrees with everything. Adding
a sixth game means touching all five places, and missing one would otherwise
surface far from the change — as a dropdown entry that cannot be configured, or
an activation that leaves an audience looking at a blank slide.

### Activation lands in a renderable state

Each game page calls `useGameState({ …, name: 'preparing' })` on mount, so
activation produces a broadcast state immediately and the slide shows the cast
page in its preparing phase. That is exactly the behaviour §14 describes, and it
falls out of the existing design rather than needing anything added.

### Viewing Rate — excluded, deliberately

§39 says to expose only games whose configuration _and cast behaviour_ make sense
in PowerPoint. Viewing Rate has no cast page **anywhere** — the desktop app has no
`cast-viewing-rates` route either — so there is nothing to put on a slide. It is
excluded on those grounds, not because of an add-in limitation.

`GameSettings` also still lacks a `viewingRate` key (§8.1), so it could not be
expressed as a preset without that being fixed first. To include it later:
add the key to `GameSettings`, build a cast page, then add it to `PRESET_GAMES` —
in that order.

### Leaderboard — excluded from presets, but still cast

A leaderboard has no settings type, so it cannot be _configured_ on a slide and
is not in the preset union. It is still a state BuzzMaster broadcasts, and the
add-in renders it when it arrives — so a leaderboard shown on the desktop cast
appears on the slide too. Tested.

---

## Phase 8 — Packaging

**IMPLEMENTED (2026-09-09), NOT YET VERIFIED ON A PACKAGED INSTALL.**

- `src-electron/powerpoint/provision.ps1` — generates and trusts a per-user
  certificate, and registers the manifest with Office;
- `src-electron/powerpoint/provisioning.ts` — runs it at every launch,
  idempotently, never fatally;
- `certificate.ts` now resolves the provisioned certificate in production;
- `extraResources` ships the manifest and the script alongside the app;
- the renderer is already served from `import.meta.dirname`, which is where
  Quasar puts `index.html` in a packaged build — one build output, served both to
  the app windows and over HTTPS to the add-in.

Success condition:

> Installing a release build provides everything required for PowerPoint Desktop
> integration without developer tooling. — **written, not demonstrated.** See
> "What is still unproven" below.

### Provisioning runs from the app, not the installer

Deliberate, and for three separate reasons:

1. Everything needed is **per user** — `CurrentUser` certificate store, `HKCU`
   registry — so there is no elevation and no UAC prompt. Phase 0 Q1a confirmed
   this raises a certificate prompt but never an elevation prompt, which is what
   keeps §23.1's per-user install intact.
2. A machine-wide installer cannot provision per-user state for users who did not
   run it. A second user on a shared machine would silently have no integration.
3. **Certificates expire.** §23.2 names silent expiry as a production failure
   mode: the integration breaks months after install with no obvious cause. A
   launch-time check renews within 30 days of expiry; an install-time script
   never would.

The certificate is generated on the user's machine and never shipped. A key in
the installer would be a shared secret across every install, which §23 rules out.
The PFX passphrase is random per installation for the same reason.

### R6 — the deployment answer, and its caveat

The manifest is registered by writing `HKCU\Software\Microsoft\Office\<ver>\WEF\Developer`.
Office versions are **enumerated rather than hardcoded**, and filtered to 15.0+
(web add-ins arrived in Office 2013). Real machines carry stale keys: the machine
this was developed on still has an Office **8.0** key, and writing there would be
litter no Office build reads.

**This is the mechanism Phase 0 Q7 could not confirm.** It is now implemented
properly rather than as an ad-hoc script, but the finding stands: Q7 observed
`HasRegistryAddin` remaining `0`. Whether that was a stale PowerPoint cache, an
incomplete restart, or the mechanism genuinely not working was never resolved,
because the trusted catalog was registered at the same time and took precedence.

**Resolving that is the single most important remaining task in this plan.** If
registry registration does not work, there is no supported per-user deployment
path at all, and §35's alternatives are AppSource (which R6 says is closed to
content add-ins) or M365 admin deployment (useless for individual users).

### What is still unproven

Everything here is written and unit-tested where it can be, but none of it has
been exercised through an actual packaged install:

- whether PowerPoint picks up the registry-registered manifest after a cold
  start (the Q7 question);
- whether `process.resourcesPath` resolves as expected in the built app;
- whether the provisioned certificate is accepted by WebView2 when it was created
  by the app rather than by hand;
- **uninstall cleanup is not implemented.** `provision.ps1 -Remove` exists and
  works, but nothing calls it on uninstall. NSIS would need a custom uninstall
  hook, and leaving a trusted root certificate behind after uninstall is not
  acceptable to ship.

Do not treat Phase 8 as done until a real build has been installed and driven end
to end on a machine that has never had the dev tooling on it.

---

## Phase 9 — Hardening

Add:

- runtime protocol validation;
- origin allowlist (§26.2) — the primary control; move earlier if convenient;
- ~~session authentication token~~ — dropped for v1, see §26.1;
- origin checking;
- reconnect;
- version compatibility;
- error UX;
- logging;
- automated tests.

---

# 40. Future: automatic slide activation

After the Office.js-only integration is stable, evaluate:

```ts
activation:
  | { type: 'manual' }
  | { type: 'slide-enter' }
  | { type: 'animation'; step: number };
```

The first version should **not** depend on this.

If PowerPoint's stable JavaScript APIs eventually expose sufficiently reliable slideshow navigation events, implement them directly with Office.js.

Otherwise a small Windows native/VSTO bridge can be introduced later.

The rest of the architecture would not change:

```text
VSTO slide event
      ↓
activatePreset
      ↓
existing BuzzMaster activation service
```

That is why activation should be modeled as a protocol/domain command now rather than hardcoded into the PowerPoint button.

---

# 41. Future: animation activation

Potential later UX:

```text
Activate BuzzMaster

○ Manually
○ When slide appears
● On animation step
    Step: 4
```

PowerPoint's native API exposes slideshow build events, so a VSTO bridge could eventually translate these into the same:

```text
game.activate
```

command.

Again, this is an extension rather than a redesign.

---

# 42. Recommended first supported game

Use **Simon** for the prototype.

Reasons:

- settings already exist cleanly as `SimonSettings`;
- Cast implementation is visually rich;
- state transitions are obvious;
- animation/highlight timing tests WebSocket latency well;
- it demonstrates that PowerPoint is displaying actual live state rather than static HTML;
- it exercises timer/state synchronization.

After Simon works, Buzzer should be the second mode.

---

# 43. Final target architecture

```text
                               POWERPOINT
                    ┌─────────────────────────────┐
                    │ Content Add-in              │
                    │                             │
                    │ Vue + Quasar + Office.js    │
                    │                             │
                    │ Config       Cast           │
                    └──────────┬──────────────────┘
                               │
                               │ HTTPS / WSS
                               │
                    ┌──────────▼──────────────────┐
                    │ Electron main               │
                    │                             │
                    │ PowerPointServer            │
                    │ Cast broadcaster            │
                    └──────────┬──────────────────┘
                               │ IPC
                               │
                    ┌──────────▼──────────────────┐
                    │ BuzzMaster main renderer    │
                    │                             │
                    │ GameActivationService       │
                    │ GameSettingsStore           │
                    │ GameStore                   │
                    │ WebHID                      │
                    └──────────┬──────────────────┘
                               │
                        game / cast state
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
          Electron Cast              PowerPoint Cast
               IPC                         WSS
```

---

# 44. Key architectural rules

1. **BuzzMaster owns all game logic.**
2. **PowerPoint stores presets, not runtime state.**
3. **PowerPoint never directly accesses buzzer hardware.**
4. **Existing Electron IPC remains in place.**
5. **PowerPoint uses WebSockets because it cannot access Electron IPC.**
6. **Existing Cast components are reused rather than duplicated.**
7. **Settings forms should become reusable, store-independent components.**
8. **PowerPoint settings are persisted per embedded add-in instance.**
9. **Manual activation is the v1 trigger.**
10. **Automatic PowerPoint triggers remain an optional future extension.**
11. **VSTO is not required for the initial architecture.**
12. **PowerPoint-specific code stays outside the normal Electron renderer wherever practical.**

---

# 45. Definition of Done for v1

The PowerPoint integration is considered complete when:

- BuzzMaster installs normally on Windows;
- PowerPoint Desktop can insert a BuzzMaster content element;
- multiple BuzzMaster elements can exist in one `.pptx`;
- every element has independent persistent settings;
- edit mode displays configuration;
- Slide Show mode displays presentation UI;
- PowerPoint detects whether BuzzMaster is available;
- the user can manually prepare the configured game;
- BuzzMaster loads the selected game and settings;
- the PowerPoint element changes to live Cast mode;
- Cast updates are reflected with no noticeable local latency;
- temporary WebSocket disconnects recover automatically;
- invalid/incompatible BuzzMaster versions show a useful error;
- the WebSocket server binds only to loopback and rejects any connection whose
  `Origin` is not the add-in's own (§26.2);
- every incoming message is validated at runtime against a schema (§26.6);
- a frozen v1 preset fixture still loads and activates (§9a);
- the ordinary BuzzMaster main and Cast windows continue working without PowerPoint installed or running.

This gives BuzzMaster a PowerPoint integration without making PowerPoint part of the game engine and without introducing a native Office dependency. The native/VSTO path remains available later if automatic slide and animation triggers prove valuable.
