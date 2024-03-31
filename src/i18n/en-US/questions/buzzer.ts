export default {
  title: 'Buzzer',

  waitingForBuzzer: 'Waiting for buzzer...',
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
      answerTime: 'Answer time',
      multipleAttempts: 'Allow multiple attempts per team',
      playSounds: 'Play sounds',
      beepAt: 'Start countdown beep at',
      points: 'Score',
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
