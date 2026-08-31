export default {
  preparing: {
    title: 'Quiz',

    settings: {
      changeMode: {
        label: 'Antwortänderung erlauben',
        option: {
          never: 'Nie',
          always: 'Immer',
          confirm: 'Bestätigen',
        },
      },
      answerTime: 'Antwortzeit',
      leaderboard: {
        correct: 'Richtig',
        wrong: 'Falsch',
        points: '{n} pkt.',
      },
      ordering:
        'Drücke die farbigen Tasten in der richtigen Reihenfolge. Rot setzt zurück.',
    },
  },

  running: {
    ordering: 'Gib eine Folge aus {n} Tasten ein',
    redResets: 'Rot setzt deine Eingabe zurück',
  },

  completed: {
    points: 'Punkte',
    correctOrder: 'Richtige Reihenfolge',
    waitingForCorrectOrder: 'Warte auf die richtige Reihenfolge',
    waitingForModerator:
      'Das Ergebnis erscheint, sobald die Spielleitung es auswählt.',
    correctAnswers: 'Richtige Antworten',
  },
};
