import buzzer from './buzzer';
import quiz from './quiz';
import simon from './simon';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';

export default {
  title: 'Modo Juego',

  action: {
    buzzer: 'Pulsador',
    quiz: 'Quiz',
    simon: 'Simon',
    stopwatch: 'Contrareloj',
    viewingRate: 'Tasa de visualización',
  },

  buzzer,
  quiz,
  simon,
  stopwatch,
  viewingRate,
};
