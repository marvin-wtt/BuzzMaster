export default {
  preparing: {
    title: 'Quiz',

    settings: {
      changeMode: {
        label: 'Permitir cambio de respuesta',
        option: {
          never: 'Nunca',
          always: 'Siempre',
          confirm: 'Confirmar',
        },
      },
      answerTime: 'Tiempo de Respuesta',
      leaderboard: {
        correct: 'Correcto',
        wrong: 'Incorrecto',
        points: '{n} pts.',
      },
      ordering:
        'Pulsa los botones de colores en el orden correcto. Rojo reinicia.',
    },
  },

  running: {
    ordering: 'Introduce una secuencia de {n} botones',
    redResets: 'Rojo reinicia tu secuencia',
  },

  completed: {
    points: 'Puntos',
    correctOrder: 'Orden correcto',
    waitingForCorrectOrder: 'Esperando el orden correcto',
    waitingForModerator:
      'El resultado aparecerá cuando el moderador lo seleccione.',
    correctAnswers: 'Respuestas correctas',
  },
};
