import question from './questions';
import devices from './devices';
import scoreboard from './scoreboard';
import batterySaving from './batterySaving';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Geräte',
  },

  batterySaving,
  devices,
  question,
  scoreboard,
};
