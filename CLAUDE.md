# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev          # Start Electron app in development mode
npm run build        # Build Electron app for production
npm run lint         # ESLint (src*/**/*.{ts,js,cjs,mjs,vue})
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
npm run test:unit    # Run vitest in watch mode
npm run test:unit:ci # Run vitest once (CI)
npm run test:unit:ui # Run vitest with UI
```

To run a single test file:

```sh
npx vitest run test/vitest/__tests__/BuzzerPage.test.ts
```

## Architecture

BuzzMaster is an **Electron + Quasar + Vue 3** desktop app for hosting quiz shows with PlayStation buzz controllers (HID devices).

### Two-Window Architecture

The app spawns two Electron `BrowserWindow` instances:

- **Main window** (`/`) — the host's control interface
- **Cast window** (`/cast`) — the audience-facing display (always-on-top, transparent frame)

Windows communicate via Electron IPC channels defined in `src-electron/castAPI/`. The main window sends game state updates; the cast window mirrors them and routes to the appropriate cast page. The cast window stores a snapshot of the last received data so it can replay it when a new cast window is opened (`cast:ready` event).

The three IPC namespaces are:

- `appAPI` — OS-level functions (locale, window management)
- `windowAPI` — Window controls (minimize, maximize, close)
- `castAPI` — Game state synchronization to the cast window

Preload scripts in `src-electron/*/preload.ts` expose safe IPC bridges to the renderer via `window.appAPI`, `window.windowAPI`, and `window.castAPI`. Types for these APIs are declared in `common/`.

### Game State Machine

Each game mode implements a state machine using the `useGameState` composable (`src/composables/gameState.ts`):

- **State types** are discriminated unions defined in `common/gameState/` (e.g., `BuzzerState`, `QuizState`, `SimonState`). Each state has a `game` field (game mode name) and a `name` field (phase within that game).
- **`useGameStore`** (Pinia, `src/stores/game-store.ts`) holds the current `GameState`. Transitions between different `game` values are illegal and throw; you must reset first.
- **`useGameState<S>(initialState)`** wraps `useGameStore` and provides:
  - `gameState` — reactive read of current state
  - `transition(from, to)` — type-safe state transition builder
  - `onStateEntry`, `onStateExit`, `onStateDo` — lifecycle hooks per state name
  - `createEvent` — chains multiple transition rules

Game page components (e.g., `src/pages/gameModes/BuzzerGamePage.vue`) call `useGameState` with the initial state and wire up buzzer events to `transition` calls.

The cast store (`src/stores/cast-store.ts`) independently mirrors the game state for the cast window and handles routing to the correct cast page.

### Buzzer Plugin

`src/plugins/buzzer/` wraps the WebHID API:

- `BuzzerApi` — top-level API; holds reactive arrays of `dongles` and `disconnectedDongles`, emits `press`/`release`/`change` events
- `Dongle` — one USB dongle (up to 4 controllers per dongle)
- `Controller` — one physical controller with `setLight()`, `buttons`, and `find()` (flash to locate)
- HID device implementations live in `src/plugins/buzzer/hid/` (PS2, PS3)
- `useBuzzer()` composable injects the API and exposes `controllers` (flat list, disabled ones filtered out), `dongles`, and `buzzer` (the API itself)
- New HID device vendor/product IDs must be registered in both `src/plugins/buzzer/hid/index.ts` and `src-electron/electron-main.ts` (`setDevicePermissionHandler`)

### Common Package

`common/` is shared between the renderer and main process. It contains:

- `gameState/` — all game state type definitions
- `gameSettings/` — settings types per game mode
- `AppAPI`, `WindowAPI`, `CastAPI` — TypeScript interfaces for the IPC bridges

### Stores (Pinia)

| Store                  | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `game-store`           | Current game state (main window)                        |
| `cast-store`           | Mirrored game state (cast window), handles cast routing |
| `game-settings-store`  | Per-game settings (answer time, modes, etc.)            |
| `leaderboard-store`    | Points tracking across rounds                           |
| `battery-saving-store` | Battery saving warning state                            |
| `updater-store`        | Auto-update state                                       |

### Internationalization

Locales: `en-US` (master schema), `de-DE`, `es-ES`. Located in `src/i18n/`. The `en-US` locale is the TypeScript source of truth — all keys must exist there first. The locale is persisted via `appAPI.setLocale` / `appAPI.getLocale`.

When adding a new game mode, add translation files under `src/i18n/{locale}/gameMode/` and `src/i18n/{locale}/cast/`, then re-export from the index files.

### Testing

Tests use **vitest** + **@vue/test-utils** + **@pinia/testing**. Test files live in `test/vitest/__tests__/`. Test utilities:

- `test/vitest/utils/mount.ts` — `mountPage()` helper that sets up Quasar, Pinia, router, and the buzzer plugin
- `test/vitest/utils/buzzer.ts` — `createDevice()` for simulating HID input in tests
- `test/vitest/utils/element-selector.ts` — `selector()` for `data-testid` attribute queries
- `test/vitest/install-timer.ts` — `installFakeTimer()` for time-based state transitions

Game page tests drive the state machine by directly calling `gameStore.transition()` and simulating button presses via `pressAndRelease()`.
