export default {
  preparing: {
    title: 'Quiz',

    settings: {
      changeMode: {
        label: 'Allow answer change',
        option: {
          never: 'Never',
          always: 'Always',
          confirm: 'Confirm',
        },
      },
      answerTime: 'Answer time',
      leaderboard: {
        correct: 'Correct',
        wrong: 'Wrong',
        points: '{n} pts.',
      },
      ordering: 'Press the colored buttons in the correct order. Red resets.',
    },
  },

  running: {
    ordering: 'Enter a sequence of {n} buttons',
    redResets: 'Red resets your sequence',
  },

  completed: {
    points: 'Points',
    correctOrder: 'Correct order',
    waitingForCorrectOrder: 'Waiting for the correct order',
    waitingForModerator:
      'The result will appear when the moderator selects it.',
    correctAnswers: 'Correct answers',
  },
};
