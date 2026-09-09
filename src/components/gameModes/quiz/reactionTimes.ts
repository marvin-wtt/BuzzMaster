import type { BuzzerButton } from '@/plugins/buzzer/types';

export interface ReactionTime {
  controllerId: string;
  button: BuzzerButton;
  /** Seconds between the start of the round and the locked in answer */
  reactionTime: number;
  /** Undefined as long as the correct answer has not been revealed */
  correct: boolean | undefined;
}

/**
 * Seconds a controller took to lock in its answer.
 *
 * Answer times hold the remaining time of the countdown at the moment an answer
 * was locked in, so the reaction time is the elapsed part of the answer time.
 * Undefined if the controller has no recorded answer time.
 */
export const reactionTimeOf = (
  answerTimes: Record<string, number>,
  controllerId: string,
  answerTime: number,
): number | undefined => {
  const time = answerTimes[controllerId];

  return time === undefined ? undefined : Math.max(0, answerTime - time);
};

/**
 * Formats a reaction time for display.
 *
 * Two decimals, as answers are often only milliseconds apart and a shared
 * displayed time would make the bonus for the fastest answer look arbitrary.
 */
export const formatReactionTime = (reactionTime: number): string =>
  reactionTime.toFixed(2);

/**
 * Ranks all given answers by their reaction time, fastest first.
 */
export const rankReactionTimes = (
  answers: Record<string, BuzzerButton>,
  answerTimes: Record<string, number>,
  answerTime: number,
  correct: BuzzerButton[] | undefined,
): ReactionTime[] => {
  return Object.entries(answers)
    .flatMap(([controllerId, button]) => {
      const reactionTime = reactionTimeOf(
        answerTimes,
        controllerId,
        answerTime,
      );

      return reactionTime === undefined
        ? []
        : [
            {
              controllerId,
              button,
              reactionTime,
              correct:
                correct === undefined ? undefined : correct.includes(button),
            },
          ];
    })
    .sort((a, b) => a.reactionTime - b.reactionTime);
};
