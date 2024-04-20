import { boot } from 'quasar/wrappers';
import { BuzzerPlugin } from 'src/plugins/buzzer';

export default boot(async ({ app }) => {
  app.use(BuzzerPlugin);
});
