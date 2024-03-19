import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';

export default {
  title: 'Fragen',

  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    stopwatch: 'Stoppuhr',
  },

  buzzer,
  quiz,
  stopwatch,
};
