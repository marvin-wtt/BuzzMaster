import { boot } from 'quasar/wrappers';
import Buzzer from 'src/plugins/buzzer';

export default boot(({ app }) => {
  app.provide('buzzer', Buzzer());
});
