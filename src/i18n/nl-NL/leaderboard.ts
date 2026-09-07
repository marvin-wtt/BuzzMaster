export default {
  title: 'Scorebord',
  noEntries: 'Geen actieve buzzer beschikbaar!',
  action: {
    reset: 'Reset',
    ok: 'Ok',
  },
  update: {
    title: '{name} bijwerken',
    field: {
      label: 'Punten',
      hint: 'Nieuwe punten: {points}',
    },
    rule: {
      onlyNumbers: 'Alleen cijfers zijn toegestaan',
      missingOperand: 'Ontbrekende operator (bijv. +2)',
      divZero: 'Kan niet delen door nul',
    },
    action: {
      submit: 'Bijwerken',
      cancel: 'Annuleren',
    },
  },
  reset: {
    title: 'Punten resetten',
    message: 'Wil je alle punten voor alle controllers resetten?',
    action: {
      ok: 'Resetten',
      cancel: 'Annuleren',
    },
  },
};
