export default {
  title: 'Pong',

  action: {
    start: 'Spiel starten',
    pause: 'Pause',
    resume: 'Fortsetzen',
    restart: 'Neustart',
    reset: 'Zurücksetzen',
    settings: 'Einstellungen',
    randomAssign: 'Zufällige Teams',
  },

  team: {
    left: 'Links',
    right: 'Rechts',
  },

  setup: {
    title: 'Team-Aufstellung',
    hint: 'Controller den Teams zuweisen, dann starten',
    startHint: 'Beide Teams benötigen mindestens einen Controller',
    noControllers: 'Keine Controller verbunden',
  },

  controls: {
    title: 'Steuerung',
    up: 'Nach oben',
    down: 'Nach unten',
    upButtons: 'Blau / Orange',
    downButtons: 'Grün / Gelb',
  },

  overlay: {
    paused: 'Pausiert',
    gameOver: 'Spiel vorbei',
  },

  settings: {
    title: 'Pong-Einstellungen',
    field: {
      rounds: 'Runden zum Sieg',
      speed: 'Ballgeschwindigkeit',
      pointsForWin: 'Punkte für das Gewinnerteam',
    },
    speed: {
      slow: 'Langsam',
      normal: 'Normal',
      fast: 'Schnell',
      turbo: 'Turbo',
    },
    action: {
      ok: 'Ok',
    },
  },
};
