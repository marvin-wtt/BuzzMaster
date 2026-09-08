import { installQuasarPlugin } from '@/../test/vitest/install-quasar';
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import QuizReactionTimesCast from '@/components/cast/quiz/QuizReactionTimesCast.vue';
import { useCastStore } from '@/stores/cast-store';
import { BuzzerButton } from '@/plugins/buzzer/types';
import { selector } from '@/../test/vitest/utils/element-selector';
import type { QuizCompleteState } from '@/../common/gameState/QuizState';
import type { GameSettings } from '@/../common/gameSettings';

// The cast store routes the cast window to the page of the current game mode
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    hasRoute: () => false,
  }),
}));

installQuasarPlugin();

const ANSWER_TIME = 30;

const mountCast = (
  state: Omit<QuizCompleteState, 'game' | 'name' | 'controllers'>,
) => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  });

  const controllers = Object.keys(state.result);
  const castStore = useCastStore();
  castStore.gameSettings = {
    quiz: {
      answerTime: ANSWER_TIME,
      showReactionTimes: true,
    },
  } as GameSettings;
  castStore.controllers = controllers.reduce<Record<string, string>>(
    (acc, id) => {
      acc[id] = `Name ${id}`;
      return acc;
    },
    {},
  );

  const wrapper = mount(QuizReactionTimesCast, {
    props: {
      state: {
        game: 'quiz',
        name: 'completed',
        controllers,
        ...state,
      },
    },
    global: {
      plugins: [pinia],
    },
  });

  return { wrapper };
};

const names = (wrapper: ReturnType<typeof mountCast>['wrapper']) =>
  wrapper
    .findAll(selector('reaction-time-entry'))
    .map((entry) => entry.text().replace(/\s+/g, ' '));

describe('QuizReactionTimesCast', () => {
  it('should rank the fastest answer first', () => {
    const { wrapper } = mountCast({
      mode: 'normal',
      result: {
        slow: BuzzerButton.BLUE,
        fast: BuzzerButton.GREEN,
      },
      answerTimes: {
        slow: 5,
        fast: 25,
      },
    });

    expect(names(wrapper)).toEqual([
      expect.stringContaining('Name fast'),
      expect.stringContaining('Name slow'),
    ]);
  });

  it('should show all answers as long as no correct answer is revealed', () => {
    const { wrapper } = mountCast({
      mode: 'normal',
      result: {
        a: BuzzerButton.BLUE,
        b: BuzzerButton.GREEN,
      },
      answerTimes: {
        a: 20,
        b: 10,
      },
    });

    expect(wrapper.findAll(selector('reaction-time-entry'))).toHaveLength(2);
  });

  it('should only show correct answers once they are revealed', () => {
    const { wrapper } = mountCast({
      mode: 'normal',
      result: {
        wrong: BuzzerButton.BLUE,
        right: BuzzerButton.GREEN,
      },
      answerTimes: {
        wrong: 25,
        right: 10,
      },
      correct: [BuzzerButton.GREEN],
    });

    expect(names(wrapper)).toEqual([expect.stringContaining('Name right')]);
  });

  it('should cut off the ranking and show the number of hidden answers', () => {
    const controllerCount = 12;
    const result = Object.fromEntries(
      Array.from({ length: controllerCount }, (_, i) => [
        `c${i}`,
        BuzzerButton.BLUE,
      ]),
    );
    const answerTimes = Object.fromEntries(
      Array.from({ length: controllerCount }, (_, i) => [`c${i}`, i]),
    );

    const { wrapper } = mountCast({
      mode: 'normal',
      result,
      answerTimes,
    });

    const entries = wrapper.findAll(selector('reaction-time-entry'));
    expect(entries.length).toBeLessThan(controllerCount);
    expect(wrapper.find(selector('reaction-times-more')).exists()).toBe(true);
  });

  it('should not cut off a ranking that fits', () => {
    const { wrapper } = mountCast({
      mode: 'normal',
      result: {
        a: BuzzerButton.BLUE,
      },
      answerTimes: {
        a: 20,
      },
    });

    expect(wrapper.find(selector('reaction-times-more')).exists()).toBe(false);
  });

  it('should show a message if nobody answered', () => {
    const { wrapper } = mountCast({
      mode: 'normal',
      result: {},
      answerTimes: {},
    });

    expect(wrapper.find(selector('reaction-times-empty')).exists()).toBe(true);
  });

  it('should show a message if nobody answered correctly', () => {
    const { wrapper } = mountCast({
      mode: 'normal',
      result: {
        a: BuzzerButton.BLUE,
      },
      answerTimes: {
        a: 20,
      },
      correct: [BuzzerButton.GREEN],
    });

    expect(wrapper.find(selector('reaction-times-empty')).exists()).toBe(true);
  });
});
