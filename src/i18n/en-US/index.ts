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
    devices: 'Devices',
    leaderboard: 'Leaderboard',
  },

  exit: {
    title: 'Exit Buzz Master',
    message: 'Are you sure you want to quit Buzz Master?',
    action: {
      ok: 'Exit',
      cancel: 'Cancel',
    },
  },

  demo: {
    title: '@:app_name Demo',
    message:
      "This is a demo version of @:{'app_name'} with limited features. We recommend you to download the latest version instead.",
    permissions:
      'In order to use the demo version you need to grant permissions to all Buzzer devices.',
    help: 'If the device is not detected by your browser, please check the devices page for troubleshooting.',
    unsupported:
      'We are sorry, but your browser does not support the required features. Supported browsers are: Chrome, Edge, Opera.',

    action: {
      ok: 'Continue',
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
