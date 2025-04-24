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
    devices: 'Geräte',
    leaderboard: 'Rangliste',
  },

  cast,
  batterySaving,
  devices,
  gameMode,
  leaderboard,

  toolbar,
  updater,
};
