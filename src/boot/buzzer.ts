import { boot } from 'quasar/wrappers';
import Buzzer from 'src/plugins/buzzer';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
  // TODO Provide buzzer API
  app.provide('buzzer', Buzzer());
});
