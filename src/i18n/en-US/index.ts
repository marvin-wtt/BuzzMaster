import gameMode from './gameMode';
import devices from './devices';
import scoreboard from './scoreboard';
import batterySaving from './batterySaving';
import cast from './cast';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Devices',
  },

  cast,
  batterySaving,
  devices,
  gameMode,
  scoreboard,
};
