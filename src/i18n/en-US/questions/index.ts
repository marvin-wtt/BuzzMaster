import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';

export default {
  title: 'Questions',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    stopwatch: 'Stopwatch',
  },

  buzzer,
  quiz,
  stopwatch,
};
