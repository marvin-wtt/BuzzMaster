import gameMode from './gameMode';
import devices from './devices';
import leaderboard from './leaderboard';
import batterySaving from './batterySaving';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Geräte',
  },

  batterySaving,
  devices,
  gameMode,
  leaderboard,
};
