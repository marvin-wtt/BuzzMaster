export default {
  title: 'Pong',
  action: {
    start: 'Start Spel',
    pause: 'Pauzeren',
    resume: 'Hervatten',
    restart: 'Herstarten',
    reset: 'Reset',
    settings: 'Instellingen',
    randomAssign: 'Willekeurige Teams',
  },
  team: {
    left: 'Links',
    right: 'Rechts',
  },
  setup: {
    title: 'Teamindeling',
    hint: 'Wijs controllers toe aan teams en start',
    startHint: 'Beide teams hebben minimaal één controller nodig',
    noControllers: 'Geen controllers verbonden',
  },
  controls: {
    title: 'Besturing',
    up: 'Omhoog',
    down: 'Omlaag',
    upButtons: 'Blauw / Oranje',
    downButtons: 'Groen / Geel',
  },
  overlay: {
    paused: 'Gepauzeerd',
    gameOver: 'Game Over',
  },
  settings: {
    title: 'Pong Instellingen',
    field: {
      rounds: 'Rondes om te winnen',
      speed: 'Balsnelheid',
      pointsForWin: 'Punten voor winnende team',
    },
    speed: {
      slow: 'Traag',
      normal: 'Normaal',
      fast: 'Snel',
      turbo: 'Turbo',
    },
    action: {
      ok: 'OK',
    },
  },
};
