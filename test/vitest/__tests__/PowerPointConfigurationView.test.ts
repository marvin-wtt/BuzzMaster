import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import { selector } from '@/../test/vitest/utils/element-selector';
import { defaultPresetFor } from '@/../common/gamePreset/defaults';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';
import PowerPointConfigurationView from '@/components/powerpoint/PowerPointConfigurationView.vue';
import SimonSettingsForm from '@/components/gameModes/simon/SimonSettingsForm.vue';

installQuasarPlugin();

type ViewInternals = {
  onGameChange: (game: string | null) => void;
  onSettingsChange: () => void;
};

const mountView = (preset?: GamePreset) =>
  mount(PowerPointConfigurationView, {
    props: { instanceId: 'instance-1', preset },
  });

describe('PowerPointConfigurationView', () => {
  it('renders the form for the configured game', () => {
    const wrapper = mountView(defaultPresetFor('simon'));

    expect(wrapper.find(selector('simon-answer-time')).exists()).toBe(true);
  });

  it('swaps the form when the game mode changes', async () => {
    const wrapper = mountView(defaultPresetFor('simon'));

    (wrapper.vm as unknown as ViewInternals).onGameChange('pong');
    await wrapper.vm.$nextTick();

    expect(wrapper.find(selector('pong-rounds')).exists()).toBe(true);
    expect(wrapper.find(selector('simon-answer-time')).exists()).toBe(false);
  });

  it('emits a complete preset when the game mode changes', async () => {
    const wrapper = mountView(defaultPresetFor('simon'));

    (wrapper.vm as unknown as ViewInternals).onGameChange('pong');
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted('update:preset');
    expect(emitted).toBeTruthy();

    const preset = emitted?.at(-1)?.[0] as GamePreset;
    expect(preset.game).toBe('pong');
    // Seeded with defaults, so it is activatable immediately.
    expect(preset.settings).toMatchObject({ rounds: 7, speed: 'normal' });
  });

  it('clears the preset when the game mode is cleared', async () => {
    const wrapper = mountView(defaultPresetFor('simon'));

    (wrapper.vm as unknown as ViewInternals).onGameChange(null);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:preset')?.at(-1)?.[0]).toBeUndefined();
    expect(wrapper.find(selector('pp-no-game')).exists()).toBe(true);
  });

  /**
   * Regression: `onSettingsChange` used to deep-copy with `structuredClone`,
   * which throws `DataCloneError` on a Vue reactive proxy — and a `ref`'s value
   * is exactly that. Every settings edit threw, so nothing ever propagated and
   * the add-in looked completely unreactive.
   */
  it('emits an update when settings are edited, without throwing', async () => {
    const wrapper = mountView(defaultPresetFor('simon'));

    expect(() =>
      (wrapper.vm as unknown as ViewInternals).onSettingsChange(),
    ).not.toThrow();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:preset')).toBeTruthy();
  });

  it('emits a plain object, not a reactive proxy', async () => {
    // What is emitted goes into Office document settings, which serialises it.
    // A proxy that cannot be cloned would fail at persist time instead.
    const wrapper = mountView(defaultPresetFor('simon'));

    (wrapper.vm as unknown as ViewInternals).onSettingsChange();
    await wrapper.vm.$nextTick();

    const preset = wrapper.emitted('update:preset')?.at(-1)?.[0];
    expect(() => structuredClone(preset)).not.toThrow();
  });

  it('propagates a real field edit all the way up', async () => {
    // The full chain the user exercises: a form field mutates its model in
    // place -> PowerPointGameSettings' deep watch fires -> the view emits an
    // updated preset for the add-in to persist.
    const wrapper = mountView(defaultPresetFor('simon'));

    const form = wrapper.findComponent(SimonSettingsForm);
    const model = form.props('modelValue') as { answerTime: number };
    model.answerTime = 12;

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const preset = wrapper.emitted('update:preset')?.at(-1)?.[0] as GamePreset;
    expect(preset).toBeDefined();
    expect(preset.game).toBe('simon');
    expect((preset.settings as { answerTime: number }).answerTime).toBe(12);
  });

  it('keeps appearance behind a button rather than inline', () => {
    // Appearance is set once and then left alone, so it does not take up space
    // in a slide-sized element.
    const wrapper = mountView(defaultPresetFor('simon'));

    expect(wrapper.find(selector('pp-open-appearance')).exists()).toBe(true);
    expect(wrapper.find(selector('pp-theme')).exists()).toBe(false);
  });

  it('adopts a preset arriving after Office initialises', async () => {
    // The config is read from the document asynchronously, so the view mounts
    // before there is anything to edit.
    const wrapper = mountView(undefined);
    expect(wrapper.find(selector('pp-no-game')).exists()).toBe(true);

    await wrapper.setProps({ preset: defaultPresetFor('quiz') });

    expect(wrapper.find(selector('quiz-mode')).exists()).toBe(true);
  });
});
