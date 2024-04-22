import gameMode from './gameMode';
import devices from './devices';
import scoreboard from './scoreboard';
import batterySaving from './batterySaving';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Devices',
  },

  batterySaving,
  devices,
  gameMode,
  scoreboard,
};
