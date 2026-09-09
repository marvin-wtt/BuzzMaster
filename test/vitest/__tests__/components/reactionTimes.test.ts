import { describe, expect, it } from 'vitest';
import { BuzzerButton } from '@/plugins/buzzer/types';
import {
  formatReactionTime,
  rankReactionTimes,
  reactionTimeOf,
} from '@/components/gameModes/quiz/reactionTimes';

describe('reactionTimes', () => {
  describe('reactionTimeOf', () => {
    it('should return the elapsed part of the answer time', () => {
      expect(reactionTimeOf({ a: 22.5 }, 'a', 30)).toBe(7.5);
    });

    it('should return undefined without a recorded answer time', () => {
      expect(reactionTimeOf({}, 'a', 30)).toBeUndefined();
    });

    it('should not return a negative time', () => {
      // The answer time may be changed in the settings after a round
      expect(reactionTimeOf({ a: 40 }, 'a', 30)).toBe(0);
    });
  });

  describe('formatReactionTime', () => {
    it('should show two decimals', () => {
      expect(formatReactionTime(7.5)).toBe('7.50');
      expect(formatReactionTime(1.238)).toBe('1.24');
      expect(formatReactionTime(0)).toBe('0.00');
    });
  });

  describe('rankReactionTimes', () => {
    const answers = {
      slow: BuzzerButton.BLUE,
      fast: BuzzerButton.GREEN,
      medium: BuzzerButton.BLUE,
    };
    const answerTimes = {
      slow: 5,
      fast: 25,
      medium: 15,
    };

    it('should rank the fastest answer first', () => {
      const ranking = rankReactionTimes(answers, answerTimes, 30, undefined);

      expect(ranking.map(({ controllerId }) => controllerId)).toEqual([
        'fast',
        'medium',
        'slow',
      ]);
      expect(ranking.map(({ reactionTime }) => reactionTime)).toEqual([
        5, 15, 25,
      ]);
    });

    it('should not mark answers without a revealed correct answer', () => {
      const ranking = rankReactionTimes(answers, answerTimes, 30, undefined);

      expect(ranking.every(({ correct }) => correct === undefined)).toBe(true);
    });

    it('should mark the correct answers', () => {
      const ranking = rankReactionTimes(answers, answerTimes, 30, [
        BuzzerButton.BLUE,
      ]);

      expect(
        ranking.map(({ controllerId, correct }) => [controllerId, correct]),
      ).toEqual([
        ['fast', false],
        ['medium', true],
        ['slow', true],
      ]);
    });

    it('should skip answers without a recorded answer time', () => {
      const ranking = rankReactionTimes(
        answers,
        { fast: 25 },
        30,
        undefined,
      ).map(({ controllerId }) => controllerId);

      expect(ranking).toEqual(['fast']);
    });

    it('should return an empty ranking without answers', () => {
      expect(rankReactionTimes({}, {}, 30, undefined)).toEqual([]);
    });
  });
});
