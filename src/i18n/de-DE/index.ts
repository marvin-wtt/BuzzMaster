import gameMode from './gameMode';
import devices from './devices';
import leaderboard from './leaderboard';
import batterySaving from './batterySaving';
import cast from './cast';
import updater from './updater';
import toolbar from './toolbar';
import online from './online';

export default {
  app_name: 'Buzz Master',

  action: {
    start: 'Start',
    devices: 'Geräte',
    leaderboard: 'Rangliste',
  },

  exit: {
    title: 'Buzz Master beenden',
    message: 'Möchtest du Buzz Master wirklich schließen?',
    action: {
      ok: 'Beenden',
      cancel: 'Abbrechen',
    },
  },

  cast,
  batterySaving,
  devices,
  gameMode,
  leaderboard,

  toolbar,
  updater,
  online,
};
