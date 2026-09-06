export default {
  title: 'Quiz',

  controllersReady: '{count} Controladores listos!',

  action: {
    start: 'Empezar',
    settings: 'Ajustes',
    reOpen: 'Re-abrir',
    quickPlay: 'Juego rápido',
    reset: 'Resetear',
    cancel: 'Cancelar',
    nextRound: 'Siguiente ronda',
  },

  settings: {
    title: 'Ajustes',

    field: {
      activeButtons: {
        label: 'Activar botones',
        rules: {
          maxLength: 'Activar al menos 2 botones',
        },
        option: {
          blue: 'Azul',
          orange: 'Naranja',
          green: 'Verde',
          yellow: 'Amarillo',
        },
      },
      changeMode: {
        label: 'Permitir cambiar respuesta',
        option: {
          never: 'Nunca',
          always: 'Siempre',
          confirm: 'Confirmar',
        },
      },
      answerTime: 'Tiempo de respuesta',
      mode: {
        label: 'Modo',
        option: {
          normal: 'Normal',
          survey: 'Supervivencia',
          elimination: 'Eliminación',
          ordering: 'Orden',
        },
        description: {
          normal: 'Elige la respuesta correcta y asigna puntos.',
          survey: 'Recopila y muestra todas las respuestas seleccionadas.',
          elimination:
            'Solo los jugadores correctos avanzan a la siguiente ronda.',
          ordering: 'Introduce un orden y después revela la solución correcta.',
        },
      },
      points: 'Puntos',
      pointsCorrect: 'Respuesta correcta',
      pointsWrong: {
        label: 'Respuesta incorrecta',
        hint: 'Introduce un número negativo para restar puntos',
      },
      sounds: 'Sonidos',
      playSounds: 'Reproducir sonidos',
      beepAt: 'Iniciar pitido de cuenta atrás en',
    },

    action: {
      ok: 'Ok',
    },
  },

  ordering: {
    submittedAnswers: 'Respuestas enviadas',
    noAnswer: 'Sin respuesta',
    redResets: 'Rojo reinicia tu secuencia',
    resetCorrectOrder: 'Restablecer el orden correcto',
  },
};
