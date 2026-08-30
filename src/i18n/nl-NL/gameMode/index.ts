import buzzer from './buzzer';
import pong from './pong';
import quiz from './quiz';
import simon from './simon';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';

export default {
  title: 'Spelmodus',
  action: {
    buzzer: 'Buzzer',
    quiz: 'Quiz',
    simon: 'Simon',
    stopwatch: 'Stopwatch',
    viewingRate: 'Kijkcijfers',
    pong: 'Pong',
  },
  section: {
    show: 'Toon',
    games: 'Spellen',
    utilities: 'Hulpmiddelen',
  },
  noEntries: 'Geen items beschikbaar in deze sectie',
  buzzer,
  pong,
  quiz,
  simon,
  stopwatch,
  viewingRate,
};
