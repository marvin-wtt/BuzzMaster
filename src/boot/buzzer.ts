import { boot } from 'quasar/wrappers';
import { initBuzzerApi } from 'src/plugins/buzzer';

export default boot(async ({ app }) => {
  const buzzerApi = await initBuzzerApi();
  app.provide('buzzer', buzzerApi);
});
