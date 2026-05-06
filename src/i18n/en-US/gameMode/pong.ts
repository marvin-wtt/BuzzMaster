export default {
  title: 'Pong',

  action: {
    start: 'Start Game',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    reset: 'Reset',
  },

  team: {
    left: 'Left',
    right: 'Right',
  },

  setup: {
    title: 'Team Setup',
    hint: 'Assign controllers to teams, then start',
    startHint: 'Both teams need at least one controller',
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
};
