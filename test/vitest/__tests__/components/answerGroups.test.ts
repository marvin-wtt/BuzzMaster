import { describe, expect, it } from 'vitest';
import { BuzzerButton } from '@/plugins/buzzer/types';
import { groupAnswersByButton } from '@/components/gameModes/quiz/answerGroups';

describe('answerGroups', () => {
  const controllerNames = {
    slow: 'Slow',
    fast: 'Fast',
    other: 'Other',
  };

  it('should group the answers by the pressed button', () => {
    const groups = groupAnswersByButton(
      { slow: BuzzerButton.BLUE, other: BuzzerButton.GREEN },
      { slow: 20, other: 10 },
      controllerNames,
      30,
    );

    expect(groups[BuzzerButton.BLUE].map(({ name }) => name)).toEqual(['Slow']);
    expect(groups[BuzzerButton.GREEN].map(({ name }) => name)).toEqual([
      'Other',
    ]);
    expect(groups[BuzzerButton.YELLOW]).toEqual([]);
  });

  it('should add the reaction time of each controller', () => {
    const groups = groupAnswersByButton(
      { fast: BuzzerButton.BLUE },
      { fast: 22.5 },
      controllerNames,
      30,
    );

    expect(groups[BuzzerButton.BLUE]).toEqual([
      { controllerId: 'fast', name: 'Fast', reactionTime: 7.5 },
    ]);
  });

  it('should sort the fastest answer first', () => {
    const groups = groupAnswersByButton(
      { slow: BuzzerButton.BLUE, fast: BuzzerButton.BLUE },
      { slow: 5, fast: 25 },
      controllerNames,
      30,
    );

    expect(groups[BuzzerButton.BLUE].map(({ name }) => name)).toEqual([
      'Fast',
      'Slow',
    ]);
  });

  it('should sort controllers without a reaction time last', () => {
    const groups = groupAnswersByButton(
      { slow: BuzzerButton.BLUE, fast: BuzzerButton.BLUE },
      { fast: 25 },
      controllerNames,
      30,
    );

    expect(
      groups[BuzzerButton.BLUE].map(({ name, reactionTime }) => [
        name,
        reactionTime,
      ]),
    ).toEqual([
      ['Fast', 5],
      ['Slow', undefined],
    ]);
  });

  it('should skip controllers without a name', () => {
    const groups = groupAnswersByButton(
      { unknown: BuzzerButton.BLUE },
      { unknown: 25 },
      controllerNames,
      30,
    );

    expect(groups[BuzzerButton.BLUE]).toEqual([]);
  });
});
