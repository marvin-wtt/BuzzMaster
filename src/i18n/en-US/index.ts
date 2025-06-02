import gameMode from './gameMode';
import devices from './devices';
import leaderboard from './leaderboard';
import batterySaving from './batterySaving';
import cast from './cast';
import updater from './updater';
import toolbar from './toolbar';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Devices',
    leaderboard: 'Leaderboard',
  },

  exit: {
    title: 'Exit Buzz Master',
    message: 'Are you sure you want to quit Buzz Master?',
    action: {
      ok: 'Exit',
      cancel: 'Cancel',
    },
  },

  cast,
  batterySaving,
  devices,
  gameMode,
  leaderboard,

  toolbar,
  updater,
};
