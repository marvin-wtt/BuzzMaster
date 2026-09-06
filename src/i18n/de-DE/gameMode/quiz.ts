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
          'fastest-bonus': 'Schnellster Bonus',
        },
      },
      points: 'Punkte',
      pointsCorrect: 'Richtige Antwort',
      pointsWrong: {
        label: 'Falsche Antwort',
        hint: 'Negative Zahl eintragen, um Punkte abzuziehen',
      },
      pointsFastestBonus: 'Punkte für Schnellsten',
      sounds: 'Ton',
      playSounds: 'Ton abspielen',
      beepAt: 'Start des Countdown-Tons bei',
      castShowControllers: 'Spielernamen auf Cast-Bildschirm',
    },

    action: {
      ok: 'OK',
    },
  },
};
