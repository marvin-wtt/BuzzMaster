export default {
  title: 'Quiz',

  controllersReady: '{count} Controller bereit!',

  action: {
    start: 'Start',
    settings: 'Einstellungen',
    reOpen: 'Erneut öffnen',
    quickPlay: 'Schnellstart',
    reset: 'Zurücksetzen',
    cancel: 'Abbrechen',
    nextRound: 'Nächste Runde',
  },

  settings: {
    title: 'Einstellungen',

    field: {
      activeButtons: {
        label: 'Aktive Tasten',
        rules: {
          maxLength: 'Aktivieren Sie mindestens zwei Tasten',
        },
        option: {
          blue: 'Blau',
          orange: 'Orange',
          green: 'Grün',
          yellow: 'Gelb',
        },
      },
      changeMode: {
        label: 'Antwortänderung erlauben',
        option: {
          never: 'Nie',
          always: 'Immer',
          confirm: 'Bestätigen',
        },
      },
      answerTime: 'Antwortzeit',
      mode: {
        label: 'Modus',
        option: {
          normal: 'Quiz',
          survey: 'Umfrage',
          elimination: 'Ausscheiden',
          ordering: 'Reihenfolge',
        },
        description: {
          normal: 'Richtige Antwort auswählen und Punkte vergeben.',
          survey: 'Alle ausgewählten Antworten sammeln und anzeigen.',
          elimination:
            'Nur Spieler mit richtiger Antwort kommen in die nächste Runde.',
          ordering:
            'Reihenfolge eingeben und danach die richtige Lösung aufdecken.',
        },
      },
      points: 'Punkte',
      pointsCorrect: 'Richtige Antwort',
      pointsWrong: {
        label: 'Falsche Antwort',
        hint: 'Negative Zahl eintragen, um Punkte abzuziehen',
      },
      sounds: 'Ton',
      playSounds: 'Ton abspielen',
      beepAt: 'Start des Countdown-Tons bei',
    },

    action: {
      ok: 'OK',
    },
  },

  ordering: {
    submittedAnswers: 'Abgegebene Antworten',
    noAnswer: 'Keine Antwort',
    redResets: 'Rot setzt deine Eingabe zurück',
    resetCorrectOrder: 'Richtige Reihenfolge zurücksetzen',
  },
};
