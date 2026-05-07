import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';
import pong from './pong';

export default {
  title: 'Spielmodus',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    stopwatch: 'Stoppuhr',
    viewingRate: 'Einschaltquote',
    pong: 'Pong',
  },

  section: {
    show: 'Show',
    games: 'Spiele',
    utilities: 'Nützliches',
  },

  noEntries: 'Keine Einträge in dieser Sektion verfügbar',

  buzzer,
  quiz,
  stopwatch,
  viewingRate,
  pong,
};
