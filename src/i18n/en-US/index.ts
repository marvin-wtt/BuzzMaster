import question from './questions';
import devices from './devices';
import scoreboard from './scoreboard';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Devices',
  },

  devices,
  question,
  scoreboard,
};
