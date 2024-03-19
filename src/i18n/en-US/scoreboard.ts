export default {
  title: 'Scoreboard',

  noEntries: 'No active buzzer available!',

  action: {
    reset: 'Reset',
    ok: 'Ok',
  },

  update: {
    title: 'Update {name}',

    field: {
      label: 'Score',
      hint: `New score: {score}`,
    },

    action: {
      submit: 'Update',
      cancel: 'Cancel',
    },
  },

  reset: {
    title: 'Reset Scores',
    message: 'Do you want to reset all points for all controllers?',

    action: {
      ok: 'Reset',
      cancel: 'Cancel',
    },
  },
};
