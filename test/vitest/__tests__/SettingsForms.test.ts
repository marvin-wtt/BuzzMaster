import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import { selector } from '@/../test/vitest/utils/element-selector';
import { defaultPresetFor } from '@/../common/gamePreset/defaults';
import { PRESET_GAMES } from '@/../common/gamePreset/GamePreset';
import type { QuizSettings } from '@/../common/gameSettings/QuizSettings';
import PowerPointGameSettings from '@/components/powerpoint/PowerPointGameSettings.vue';
import QuizSettingsForm from '@/components/gameModes/quiz/QuizSettingsForm.vue';
import SimonSettingsForm from '@/components/gameModes/simon/SimonSettingsForm.vue';

installQuasarPlugin();

/**
 * Phase 2's whole purpose is that the desktop dialogs and the PowerPoint add-in
 * render the *same* components (plan §13). These tests pin that: if someone
 * adds a field to a form and it fails to appear on one of the two surfaces, the
 * sharing has been broken.
 */
describe('shared settings forms', () => {
  it('renders a form for every game a preset can describe', () => {
    for (const game of PRESET_GAMES) {
      const wrapper = mount(PowerPointGameSettings, {
        props: { modelValue: defaultPresetFor(game) },
      });

      expect(
        wrapper.findComponent({ name: 'QForm' }).exists(),
        `no form rendered for ${game}`,
      ).toBe(true);
    }
  });

  it('gives each game its own form component', () => {
    const simon = mount(PowerPointGameSettings, {
      props: { modelValue: defaultPresetFor('simon') },
    });
    const quiz = mount(PowerPointGameSettings, {
      props: { modelValue: defaultPresetFor('quiz') },
    });

    expect(simon.findComponent(SimonSettingsForm).exists()).toBe(true);
    expect(simon.findComponent(QuizSettingsForm).exists()).toBe(false);
    expect(quiz.findComponent(QuizSettingsForm).exists()).toBe(true);
  });

  it('renders the same fields the desktop dialog would', () => {
    // Mounting the form directly is what a dialog does; mounting it through the
    // add-in wrapper is what PowerPoint does. Same component, same fields.
    const preset = defaultPresetFor('simon');
    if (preset.game !== 'simon') throw new Error('expected simon');

    const direct = mount(SimonSettingsForm, {
      props: { modelValue: preset.settings },
    });
    const viaAddIn = mount(PowerPointGameSettings, {
      props: { modelValue: defaultPresetFor('simon') },
    });

    for (const field of [
      'simon-answer-time',
      'simon-showing-speed',
      'simon-auto-next-round',
      'simon-last-man-standing',
      'simon-winner-points',
    ]) {
      expect(direct.find(selector(field)).exists(), field).toBe(true);
      expect(viaAddIn.find(selector(field)).exists(), field).toBe(true);
    }
  });

  it('reports settings edits so the add-in can persist them', () => {
    const wrapper = mount(PowerPointGameSettings, {
      props: { modelValue: defaultPresetFor('simon') },
    });

    const preset = wrapper.props('modelValue');
    if (preset.game !== 'simon') throw new Error('expected simon');
    preset.settings.answerTime = 7;

    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.emitted('change')).toBeTruthy();
    });
  });
});

describe('quiz normalize()', () => {
  /**
   * This rule used to live in the dialog's OK handler, so a preset configured in
   * PowerPoint would have kept its points in survey mode. Extracting it into the
   * form is what makes both surfaces behave the same.
   */
  const surveySettings = (): QuizSettings => {
    const preset = defaultPresetFor('quiz');
    if (preset.game !== 'quiz') throw new Error('expected quiz');
    return {
      ...preset.settings,
      mode: 'survey',
      pointsCorrect: 5,
      pointsWrong: 3,
    };
  };

  it('zeroes points in survey mode', async () => {
    const settings = surveySettings();
    const wrapper = mount(QuizSettingsForm, {
      props: { modelValue: settings },
    });

    (wrapper.vm as unknown as { normalize: () => void }).normalize();
    await wrapper.vm.$nextTick();

    expect(settings.pointsCorrect).toBe(0);
    expect(settings.pointsWrong).toBe(0);
  });

  it('leaves points alone in a scored mode', async () => {
    const settings = { ...surveySettings(), mode: 'normal' as const };
    const wrapper = mount(QuizSettingsForm, {
      props: { modelValue: settings },
    });

    (wrapper.vm as unknown as { normalize: () => void }).normalize();
    await wrapper.vm.$nextTick();

    expect(settings.pointsCorrect).toBe(5);
    expect(settings.pointsWrong).toBe(3);
  });

  it('is reachable through the add-in wrapper too', () => {
    const preset = defaultPresetFor('quiz');
    if (preset.game !== 'quiz') throw new Error('expected quiz');
    Object.assign(preset.settings, {
      mode: 'survey',
      pointsCorrect: 9,
      pointsWrong: 4,
    });

    const wrapper = mount(PowerPointGameSettings, {
      props: { modelValue: preset },
    });

    (wrapper.vm as unknown as { normalize: () => void }).normalize();

    expect(preset.settings.pointsCorrect).toBe(0);
    expect(preset.settings.pointsWrong).toBe(0);
  });
});
