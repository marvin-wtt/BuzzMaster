import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';
import pong from './pong';

export default {
  title: 'Game Mode',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    stopwatch: 'Stopwatch',
    viewingRate: 'Viewing Rate',
    pong: 'Pong',
  },

  section: {
    show: 'Show',
    games: 'Games',
    utilities: 'Utilities',
  },

  noEntries: 'No Entries available in this section',

  buzzer,
  quiz,
  stopwatch,
  viewingRate,
  pong,
};
