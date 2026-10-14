import type { BuzzerSettings } from '@/../common/gameSettings/BuzzerSettings';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import type { SimonSettings } from '@/../common/gameSettings/SimonSettings';
import type { StopwatchSettings } from '@/../common/gameSettings/StopwatchSettings';
import type { PongSettings } from '@/../common/gameSettings/PongSettings';

/**
 * What an external frontend (currently PowerPoint) stores in order to configure
 * BuzzMaster. Deliberately *not* runtime state: `GameState` stays owned by
 * BuzzMaster alone.
 *
 * This type is persisted inside user documents and therefore ages differently
 * from everything else in `common/`. Treat it as a public, versioned contract:
 * see `PowerPointConfig.version` and plan section 9a before changing a field.
 */
export type GamePreset =
  | { game: 'buzzer'; settings: BuzzerSettings }
  | { game: 'quiz'; settings: QuizSettings }
  | { game: 'simon'; settings: SimonSettings }
  | { game: 'stopwatch'; settings: StopwatchSettings }
  | { game: 'pong'; settings: PongSettings };

export type PresetGame = GamePreset['game'];

/**
 * The games a preset can describe.
 *
 * Two deliberate omissions, per plan section 8.1:
 *
 * - `viewingRate` — `game-settings-store` holds `viewingRateSettings`, but
 *   `GameSettings` in common/gameSettings/index.ts has no `viewingRate` key.
 *   Adding it here first would put a preset in user documents that the settings
 *   store cannot round-trip. Add it to `GameSettings`, then here.
 * - `leaderboard` — a valid `GameState` variant with no settings type, so it
 *   cannot be expressed as a preset at all. If a leaderboard slide turns out to
 *   be wanted, `GamePreset` needs a settings-free variant, which is a schema
 *   change and therefore a version bump.
 */
export const PRESET_GAMES = [
  'buzzer',
  'quiz',
  'simon',
  'stopwatch',
  'pong',
] as const satisfies readonly PresetGame[];

export function isPresetGame(value: unknown): value is PresetGame {
  return (
    typeof value === 'string' &&
    (PRESET_GAMES as readonly string[]).includes(value)
  );
}
