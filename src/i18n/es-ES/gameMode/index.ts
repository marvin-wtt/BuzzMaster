import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';

export default {
  title: 'Modo Juego',

  action: {
    buzzer: 'Pulsador',
    quiz: 'Quiz',
    stopwatch: 'Contrareloj',
    viewingRate: 'Tasa de visualización',
  },

  buzzer,
  quiz,
  stopwatch,
  viewingRate,
};
