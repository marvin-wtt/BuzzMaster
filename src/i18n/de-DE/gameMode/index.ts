import buzzer from './buzzer';
import quiz from './quiz';
import simon from './simon';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';

export default {
  title: 'Spielmodus',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    simon: 'Simon',
    stopwatch: 'Stoppuhr',
    viewingRate: 'Einschaltquote',
  },

  buzzer,
  quiz,
  simon,
  stopwatch,
  viewingRate,
};
