import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';

export default {
  title: 'Game Mode',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    stopwatch: 'Stopwatch',
  },

  buzzer,
  quiz,
  stopwatch,
};
