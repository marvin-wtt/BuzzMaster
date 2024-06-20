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
    nextRound: 'Next Round',
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
      mode: {
        label: 'Mode',
        option: {
          normal: 'Normal',
          survey: 'Survey',
          elimination: 'Elimination',
        },
      },
      points: 'Points',
      pointsCorrect: 'Correct answer',
      pointsWrong: {
        label: 'Wrong answer',
        hint: 'Enter a negative number to subtract points',
      },
      sounds: 'Sounds',
      playSounds: 'Play sounds',
      beepAt: 'Start countdown beep at',
    },

    action: {
      ok: 'Ok',
    },
  },
};
