import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';
import simon from './simon';

export default {
  title: 'Game Mode',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    simon: 'Simon',
    stopwatch: 'Stopwatch',
    viewingRate: 'Viewing Rate',
  },

  buzzer,
  quiz,
  simon,
  stopwatch,
  viewingRate,
};
