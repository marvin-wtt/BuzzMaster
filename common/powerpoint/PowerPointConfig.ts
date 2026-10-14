import type { GamePreset } from '@/../common/gamePreset/GamePreset';

/**
 * Current persisted schema version.
 *
 * This number lives in user `.pptx` files forever. Bump it whenever the shape of
 * `PowerPointConfig` or any `GamePreset` settings type changes in a way an older
 * build would misread, and add a migration step for it.
 */
export const POWERPOINT_CONFIG_VERSION = 1;

export interface PowerPointConfig {
  version: number;

  /** Stable identity for one embedded add-in instance. */
  instanceId: string;

  preset?: GamePreset;

  activation: ActivationMode;

  appearance?: Appearance;
}

export type ThemeMode = 'dark' | 'light';

/**
 * How the element blends into its slide.
 *
 * Per element rather than global: a deck can have a dark title slide and a light
 * content slide, and each BuzzMaster element should match the one it sits on.
 */
export interface Appearance {
  theme: ThemeMode;
  /**
   * CSS colour for the element's background. Omitted means "use the theme's own
   * background".
   *
   * Not transparent: PowerPoint does not render a content add-in with a
   * see-through background, so an element cannot blend into the slide behind it.
   * Match the slide's colour instead.
   */
  background?: string;
}

/**
 * Light by default.
 *
 * Slides are overwhelmingly light, and an element that arrives dark has to be
 * changed by hand on almost every insert. The desktop app defaults to dark
 * because it is a control surface the operator stares at; an add-in is part of
 * someone else's design and should start closer to it.
 *
 * Existing elements are unaffected: they carry an explicit `theme`, so only newly
 * inserted ones pick this up.
 */
export const DEFAULT_APPEARANCE: Appearance = { theme: 'light' };

/**
 * Only `manual` exists in v1. Modelled as a discriminated union from the start so
 * that adding slide/animation triggers later is a new variant rather than a
 * schema redesign — see plan sections 40 and 41.
 */
export type ActivationMode = { type: 'manual' };

export function createConfig(instanceId: string): PowerPointConfig {
  return {
    version: POWERPOINT_CONFIG_VERSION,
    instanceId,
    activation: { type: 'manual' },
    appearance: { ...DEFAULT_APPEARANCE },
  };
}

/**
 * Return a copy of `config` with the preset replaced, or removed when undefined.
 *
 * Exists because doing this inline is a trap that has already been fallen into
 * once: rebuilding the object field by field silently drops anything not listed,
 * and changing the game mode wiped the element's appearance settings. Spreading
 * means a field added to `PowerPointConfig` survives without anyone remembering
 * to update this.
 *
 * `exactOptionalPropertyTypes` is why removal omits the key rather than
 * assigning undefined.
 */
export function withPreset(
  config: PowerPointConfig,
  preset: GamePreset | undefined,
): PowerPointConfig {
  if (!preset) {
    const { preset: _removed, ...rest } = config;
    return rest;
  }
  return { ...config, preset };
}

/** Return a copy of `config` with the appearance replaced. */
export function withAppearance(
  config: PowerPointConfig,
  appearance: Appearance,
): PowerPointConfig {
  return { ...config, appearance };
}

export type ConfigLoadResult =
  | { ok: true; config: PowerPointConfig }
  | { ok: false; reason: 'malformed' | 'too-new'; storedVersion?: number };

/**
 * Read a config that came out of a document.
 *
 * Everything here is untrusted: it was written by an arbitrarily old build of
 * BuzzMaster and has been sitting in a file since. Three rules, from plan
 * section 9a:
 *
 *  1. a version newer than we understand fails loudly rather than being coerced;
 *  2. older versions are migrated forward;
 *  3. unknown fields are dropped rather than causing a hard failure.
 */
export function loadConfig(raw: unknown): ConfigLoadResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, reason: 'malformed' };
  }

  const candidate = raw as Partial<PowerPointConfig>;

  if (
    typeof candidate.version !== 'number' ||
    !Number.isInteger(candidate.version) ||
    candidate.version < 1
  ) {
    return { ok: false, reason: 'malformed' };
  }

  if (typeof candidate.instanceId !== 'string' || !candidate.instanceId) {
    return { ok: false, reason: 'malformed' };
  }

  if (candidate.version > POWERPOINT_CONFIG_VERSION) {
    // Written by a newer BuzzMaster. Refusing is the honest outcome: the preset
    // may use settings this build cannot represent.
    return { ok: false, reason: 'too-new', storedVersion: candidate.version };
  }

  return { ok: true, config: migrate(candidate as PowerPointConfig) };
}

/**
 * Upgrade an older config to the current version, one step at a time.
 *
 * Add a case per version bump. Keep every step, and keep a frozen fixture for
 * each version in the tests — the whole point is that decks authored years ago
 * still open.
 */
function migrate(config: PowerPointConfig): PowerPointConfig {
  const migrated: PowerPointConfig = {
    version: POWERPOINT_CONFIG_VERSION,
    instanceId: config.instanceId,
    activation: config.activation ?? { type: 'manual' },
    // Predates appearance, so fall back to the default rather than leaving the
    // element unstyled. Every field added here must also be carried forward —
    // this function rebuilds the object rather than spreading it, so a forgotten
    // field is silently dropped on the next save.
    appearance: normalizeAppearance(config.appearance),
  };

  if (config.preset) {
    migrated.preset = config.preset;
  }

  return migrated;
}

/**
 * Validate an appearance read from a document.
 *
 * The background is a CSS colour written by an older or newer build, so it is
 * checked rather than trusted: an unrecognised value is dropped instead of being
 * interpolated into a style, where it would be an injection point.
 */
function normalizeAppearance(value: Appearance | undefined): Appearance {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_APPEARANCE };
  }

  // Anything unrecognised falls back to the default rather than to a hardcoded
  // theme, so this stays correct if the default ever changes again.
  const theme: ThemeMode =
    value.theme === 'dark' || value.theme === 'light'
      ? value.theme
      : DEFAULT_APPEARANCE.theme;

  return isSafeColour(value.background)
    ? { theme, background: value.background }
    : { theme };
}

/**
 * A hex colour. Deliberately narrow — this value ends up in a style binding.
 *
 * Only the hex lengths CSS actually defines: 3 and 4 (with alpha), 6, and 8.
 * A `{3,8}` range would also admit 5- and 7-digit values, which no browser
 * accepts — they would silently produce an unstyled element rather than an
 * error, which is exactly the kind of failure a slide should not have.
 *
 * `transparent` is deliberately rejected: PowerPoint does not render content
 * add-ins with a see-through background, so accepting it would offer a setting
 * that cannot work. A config that still carries it — written before this was
 * known — is dropped on read and falls back to the theme background.
 */
export function isSafeColour(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
  );
}
