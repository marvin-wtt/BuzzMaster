export default {
  title: 'Quiz',
  controllersReady: '{count} controllers klaar!',
  action: {
    start: 'Start',
    settings: 'Instellingen',
    reOpen: 'Heropenen',
    quickPlay: 'Snel spelen',
    reset: 'Reset',
    cancel: 'Annuleren',
    nextRound: 'Volgende ronde',
    reactionTimes: {
      show: 'Reactietijden op de cast tonen',
      hide: 'Resultaat op de cast tonen',
    },
  },
  result: {
    reactionTime: {
      seconds: '{n} s',
    },
  },

  settings: {
    title: 'Instellingen',
    field: {
      activeButtons: {
        label: 'Actieve knoppen',
        rules: {
          maxLength: 'Activeer minstens twee knoppen',
        },
        option: {
          blue: 'Blauw',
          orange: 'Oranje',
          green: 'Groen',
          yellow: 'Geel',
        },
      },
      changeMode: {
        label: 'Antwoord wijzigen toestaan',
        option: {
          never: 'Nooit',
          always: 'Altijd',
          confirm: 'Bevestigen',
        },
      },
      answerTime: 'Antwoordtijd',
      mode: {
        label: 'Modus',
        option: {
          normal: 'Normaal',
          survey: 'Enquête',
          elimination: 'Eliminatie',
        },
      },
      points: 'Punten',
      pointsCorrect: 'Goed antwoord',
      pointsWrong: {
        label: 'Fout antwoord',
        hint: 'Voer een negatief getal in om punten af te trekken',
      },
      pointsFastestBonus: 'Bonus voor het snelste antwoord',
      sounds: 'Geluiden',
      playSounds: 'Geluiden afspelen',
      beepAt: 'Start aftelgeluid bij',
    },
    action: {
      ok: 'Ok',
    },
  },
};
