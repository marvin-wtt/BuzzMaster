import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';
import pong from './pong';

export default {
  title: 'Modo Juego',

  action: {
    buzzer: 'Pulsador',
    quiz: 'Quiz',
    stopwatch: 'Contrareloj',
    viewingRate: 'Tasa de visualización',
    pong: 'Pong',
  },

  buzzer,
  quiz,
  stopwatch,
  viewingRate,
  pong,
};
