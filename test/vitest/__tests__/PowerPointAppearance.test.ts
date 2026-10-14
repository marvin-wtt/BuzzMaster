import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import { selector } from '@/../test/vitest/utils/element-selector';
import {
  DEFAULT_APPEARANCE,
  createConfig,
  isSafeColour,
  loadConfig,
} from '@/../common/powerpoint/PowerPointConfig';
import PowerPointAppearance from '@/components/powerpoint/PowerPointAppearance.vue';

installQuasarPlugin();

/**
 * The background colour is interpolated into a style binding, so it is validated
 * both when read from a document and when entered in the UI. A document is
 * written by arbitrarily old or new builds and edited by hand often enough that
 * trusting it is not reasonable.
 */
describe('isSafeColour', () => {
  it.each([
    '#fff',
    '#ffff', // 4-digit hex carries alpha and is valid CSS
    '#ffffff',
    '#10131A',
    '#ffffffcc',
  ])('accepts %s', (value) => {
    expect(isSafeColour(value)).toBe(true);
  });

  it.each([
    // PowerPoint does not render content add-ins with a see-through background,
    // so this is rejected rather than offered as a setting that does nothing.
    'transparent',
    'red',
    'rgb(0,0,0)',
    'url(evil)',
    '#12345', // 5 digits is not a CSS hex length
    '#1234567', // nor is 7
    '#xyzxyz',
    '',
    'expression(alert(1))',
    '#fff; background-image: url(x)',
  ])('rejects %s', (value) => {
    expect(isSafeColour(value)).toBe(false);
  });

  it.each([undefined, null, 42, {}, []])('rejects non-strings', (value) => {
    expect(isSafeColour(value)).toBe(false);
  });
});

describe('appearance persistence', () => {
  it('defaults to light with no explicit background', () => {
    // Slides are overwhelmingly light, so an element that arrives dark would
    // have to be changed by hand on almost every insert.
    const config = createConfig('i1');

    expect(config.appearance).toEqual(DEFAULT_APPEARANCE);
    expect(config.appearance?.theme).toBe('light');
  });

  it('round-trips a custom colour through a document', () => {
    const config = { ...createConfig('i1') };
    config.appearance = { theme: 'light', background: '#ffeecc' };

    const result = loadConfig(JSON.parse(JSON.stringify(config)));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.appearance).toEqual({
      theme: 'light',
      background: '#ffeecc',
    });
  });

  it('drops a stored transparent background from an older config', () => {
    // Written before we learned PowerPoint cannot render one. It degrades to the
    // theme background rather than producing an element that never appears.
    const result = loadConfig({
      version: 1,
      instanceId: 'i1',
      activation: { type: 'manual' },
      appearance: { theme: 'dark', background: 'transparent' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.appearance?.background).toBeUndefined();
  });

  it('drops an unsafe stored colour instead of applying it', () => {
    const result = loadConfig({
      version: 1,
      instanceId: 'i1',
      activation: { type: 'manual' },
      appearance: { theme: 'dark', background: 'url(javascript:alert(1))' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.appearance?.background).toBeUndefined();
    expect(result.config.appearance?.theme).toBe('dark');
  });

  it('gives a config saved before appearance existed a usable default', () => {
    // Decks authored by an earlier build carry no appearance at all.
    const result = loadConfig({
      version: 1,
      instanceId: 'i1',
      activation: { type: 'manual' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.appearance).toEqual(DEFAULT_APPEARANCE);
  });

  it('falls back to the default for an unrecognised theme', () => {
    const result = loadConfig({
      version: 1,
      instanceId: 'i1',
      activation: { type: 'manual' },
      appearance: { theme: 'neon' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.appearance?.theme).toBe(DEFAULT_APPEARANCE.theme);
  });

  it('keeps an explicitly stored dark theme', () => {
    // Elements configured before the default changed carry an explicit theme,
    // so changing the default must not restyle anyone's existing deck.
    const result = loadConfig({
      version: 1,
      instanceId: 'i1',
      activation: { type: 'manual' },
      appearance: { theme: 'dark' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.appearance?.theme).toBe('dark');
  });
});

describe('PowerPointAppearance', () => {
  it('renders the theme toggle and background selector', () => {
    const wrapper = mount(PowerPointAppearance, {
      props: { modelValue: { theme: 'dark' } },
    });

    expect(wrapper.find(selector('pp-theme')).exists()).toBe(true);
    expect(wrapper.find(selector('pp-background-mode')).exists()).toBe(true);
  });

  it('shows the colour field only for a custom background', () => {
    const theme = mount(PowerPointAppearance, {
      props: { modelValue: { theme: 'dark' } },
    });
    const custom = mount(PowerPointAppearance, {
      props: { modelValue: { theme: 'dark', background: '#123456' } },
    });

    expect(theme.find(selector('pp-background-colour')).exists()).toBe(false);
    expect(custom.find(selector('pp-background-colour')).exists()).toBe(true);
  });

  it('omits background rather than setting it undefined', async () => {
    // exactOptionalPropertyTypes: the persisted shape must not carry an
    // explicit undefined.
    const wrapper = mount(PowerPointAppearance, {
      props: { modelValue: { theme: 'dark', background: '#123456' } },
    });

    (
      wrapper.vm as unknown as { onBackgroundModeChange: (m: string) => void }
    ).onBackgroundModeChange('theme');
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0];
    expect(emitted).toEqual({ theme: 'dark' });
    expect('background' in (emitted as object)).toBe(false);
  });
});
