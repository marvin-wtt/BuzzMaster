import type { BuzzerButton } from '@/plugins/buzzer/types';

/**
 * Determines which controllers answered correctly the fastest.
 *
 * Answer times hold the remaining time of the countdown at the moment an answer
 * was locked in, so the highest time is the fastest answer. Controllers that
 * answered at the exact same time all share the bonus.
 */
export const findFastestControllers = (
  answers: Record<string, BuzzerButton>,
  answerTimes: Record<string, number>,
  correct: BuzzerButton[] | undefined,
): string[] => {
  const correctButtons = new Set(correct);

  const candidates = Object.entries(answers).flatMap(
    ([controllerId, button]) => {
      const time = answerTimes[controllerId];

      return correctButtons.has(button) && time !== undefined
        ? [{ controllerId, time }]
        : [];
    },
  );

  if (candidates.length === 0) {
    return [];
  }

  const fastestTime = Math.max(...candidates.map(({ time }) => time));

  return candidates
    .filter(({ time }) => time === fastestTime)
    .map(({ controllerId }) => controllerId);
};
