import buzzer from './buzzer';
import quiz from './quiz';
import simon from './simon';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';
import pong from './pong';

export default {
  title: 'Spielmodus',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    simon: 'Simon',
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
  simon,
  stopwatch,
  viewingRate,
  pong,
};
