import buzzer from './buzzer';
import quiz from './quiz';
import simon from './simon';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';
import pong from './pong';

export default {
  title: 'Modo Juego',

  action: {
    buzzer: 'Pulsador',
    quiz: 'Quiz',
    simon: 'Simon',
    stopwatch: 'Contrareloj',
    viewingRate: 'Tasa de visualización',
    pong: 'Pong',
  },

  section: {
    show: 'Show',
    games: 'Juegos',
    utilities: 'Utilidades',
  },

  noEntries: 'No hay entradas disponibles en esta sección',

  buzzer,
  quiz,
  simon,
  stopwatch,
  viewingRate,
  pong,
};
