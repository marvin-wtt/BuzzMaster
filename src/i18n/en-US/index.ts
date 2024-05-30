import gameMode from './gameMode';
import devices from './devices';
import leaderboard from './leaderboard';
import batterySaving from './batterySaving';
import cast from './cast';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Devices',
    leaderboard: 'Leaderboard',
  },

  cast,
  batterySaving,
  devices,
  gameMode,
  leaderboard,
};
