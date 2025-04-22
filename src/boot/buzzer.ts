import { defineBoot } from '#q-app/wrappers';
import { BuzzerPlugin } from 'src/plugins/buzzer';

export default defineBoot(({ app }) => {
  app.use(BuzzerPlugin);
});
