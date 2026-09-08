import { BuzzerButton } from '@/plugins/buzzer/types';
import { reactionTimeOf } from '@/components/gameModes/quiz/reactionTimes';

export interface ControllerAnswer {
  controllerId: string;
  name: string;
  reactionTime: number | undefined;
}

export type AnswerGroups = Record<BuzzerButton, ControllerAnswer[]>;

/**
 * Groups the answers by the pressed button, fastest answer first.
 *
 * Controllers without a name are skipped as they are no longer connected.
 */
export const groupAnswersByButton = (
  answers: Record<string, BuzzerButton>,
  answerTimes: Record<string, number>,
  controllerNames: Record<string, string>,
  answerTime: number,
): AnswerGroups => {
  const groups: AnswerGroups = {
    [BuzzerButton.RED]: [],
    [BuzzerButton.BLUE]: [],
    [BuzzerButton.ORANGE]: [],
    [BuzzerButton.GREEN]: [],
    [BuzzerButton.YELLOW]: [],
  };

  Object.entries(answers).forEach(([controllerId, button]) => {
    const name = controllerNames[controllerId];
    if (name === undefined) {
      return;
    }

    groups[button].push({
      controllerId,
      name,
      reactionTime: reactionTimeOf(answerTimes, controllerId, answerTime),
    });
  });

  // Controllers without a recorded time last
  Object.values(groups).forEach((group) =>
    group.sort(
      (a, b) =>
        (a.reactionTime ?? Number.POSITIVE_INFINITY) -
        (b.reactionTime ?? Number.POSITIVE_INFINITY),
    ),
  );

  return groups;
};
