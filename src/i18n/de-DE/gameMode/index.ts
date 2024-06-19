import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';

export default {
  title: 'Spielmodus',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    stopwatch: 'Stoppuhr',
    viewingRate: 'Einschaltquote',
  },

  buzzer,
  quiz,
  stopwatch,
  viewingRate,
};
