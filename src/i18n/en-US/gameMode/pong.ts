export default {
  title: 'Pong',

  action: {
    start: 'Start Game',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    reset: 'Reset',
    settings: 'Settings',
    randomAssign: 'Random Teams',
  },

  team: {
    left: 'Left',
    right: 'Right',
  },

  setup: {
    title: 'Team Setup',
    hint: 'Assign controllers to teams, then start',
    startHint: 'Both teams need at least one controller',
    noControllers: 'No controllers connected',
  },

  controls: {
    title: 'Controls',
    up: 'Move Up',
    down: 'Move Down',
    upButtons: 'Blue / Orange',
    downButtons: 'Green / Yellow',
  },

  overlay: {
    paused: 'Paused',
    gameOver: 'Game Over',
  },

  settings: {
    title: 'Pong Settings',
    field: {
      rounds: 'Rounds to win',
      speed: 'Ball speed',
      pointsForWin: 'Points for winning team',
    },
    speed: {
      slow: 'Slow',
      normal: 'Normal',
      fast: 'Fast',
      turbo: 'Turbo',
    },
    action: {
      ok: 'OK',
    },
  },
};
