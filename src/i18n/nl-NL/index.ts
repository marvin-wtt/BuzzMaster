import cast from './cast';
import gameMode from './gameMode';
import batterySaving from './batterySaving';
import devices from './devices';
import leaderboard from './leaderboard';
import online from './online';
import toolbar from './toolbar';
import updater from './updater';

export default {
  app_name: 'Buzz Master',
  action: {
    start: 'Start',
    devices: 'Apparaten',
    leaderboard: 'Scorebord',
  },
  exit: {
    title: 'Buzz Master Afsluiten',
    message: 'Weet je zeker dat je Buzz Master wilt afsluiten?',
    action: {
      ok: 'Afsluiten',
      cancel: 'Annuleren',
    },
  },
  cast,
  gameMode,
  batterySaving,
  devices,
  leaderboard,
  online,
  toolbar,
  updater,
};
