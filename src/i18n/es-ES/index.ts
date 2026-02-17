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
    start: 'Empezar',
    devices: 'Dispositivos',
    leaderboard: 'Clasificación',
  },

  exit: {
    title: 'Salir de Buzz Master',
    message: '¿Estas seguro que quieres salir de Buzz Master?',
    action: {
      ok: 'Salir',
      cancel: 'Cancelar',
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
