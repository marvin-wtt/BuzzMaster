export default {
  title: 'Punktestand',

  noEntries: 'Kein aktiver Controller verfügbar!',

  action: {
    reset: 'Zurücksetzen',
    ok: 'Ok',
  },

  update: {
    title: '{name} aktualisieren',

    field: {
      label: 'Punktestand',
      hint: 'Neuer Punktestand: {points}',
    },

    rule: {
      onlyNumbers: 'Nur Ziffern sind erlaubt',
      missingOperand: 'Fehlender Operator (z.B. +2)',
      divZero: 'Division durch null nicht möglich',
    },

    action: {
      submit: 'Aktualisieren',
      cancel: 'Abbrechen',
    },
  },

  reset: {
    title: 'Punktestand zurücksetzen',
    message: 'Möchtest du die Punktestände für alle Controller zurücksetzen?',

    action: {
      ok: 'Zurücksetzen',
      cancel: 'Abbrechen',
    },
  },
};
