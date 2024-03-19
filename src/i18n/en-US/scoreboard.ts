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
      hint: 'New score: {score}',
    },

    rule: {
      onlyNumbers: 'Only numerical characters are allowed',
      missingOperand: 'Missing operand (e.g. +2)',
      divZero: 'Cannot divide by zero',
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
