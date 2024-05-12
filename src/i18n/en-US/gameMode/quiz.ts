export default {
  title: 'Quiz',

  controllersReady: '{count} controllers ready!',

  action: {
    start: 'Start',
    settings: 'Settings',
    reOpen: 'Re-open',
    quickPlay: 'Quick Play',
    reset: 'Reset',
    cancel: 'Cancel',
  },

  settings: {
    title: 'Settings',

    field: {
      activeButtons: {
        label: 'Active buttons',
        rules: {
          maxLength: 'Activate at least two buttons',
        },
        option: {
          blue: 'Blue',
          orange: 'Orange',
          green: 'Green',
          yellow: 'Yellow',
        },
      },
      changeMode: {
        label: 'Allow answer change',
        option: {
          never: 'Never',
          always: 'Always',
          confirm: 'Confirm',
        },
      },
      answerTime: 'Answer time',
      resultMode: {
        label: 'Result Mode',
        option: {
          table: 'Table',
          bar: 'Bar chart',
        },
      },
      playSounds: 'Play sounds',
      beepAt: 'Start countdown beep at',
      points: 'Points',
      pointsCorrect: 'Correct answer',
      pointsWrong: {
        label: 'Wrong answer',
        hint: 'Enter a negative number to subtract points',
      },
    },

    action: {
      ok: 'Ok',
    },
  },
};
