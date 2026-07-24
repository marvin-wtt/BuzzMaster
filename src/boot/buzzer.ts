import { defineBoot } from '#q-app';
import { BuzzerPlugin } from '@/plugins/buzzer';

export default defineBoot(({ app }) => {
  app.use(BuzzerPlugin);
});
