import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';

export default {
  title: 'Game Mode',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    stopwatch: 'Stopwatch',
    viewingRate: 'Viewing Rate',
  },

  buzzer,
  quiz,
  stopwatch,
  viewingRate,
};
