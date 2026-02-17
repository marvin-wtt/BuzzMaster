export default {
  title: 'Quiz',

  controllersReady: '{count} Controladores listos!',

  action: {
    start: 'Empezar',
    settings: 'Ajustes',
    reOpen: 'Re-abrir',
    quickPlay: 'Juego rapido',
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
          elimination: 'Eliminción',
        },
      },
      points: 'Puntos',
      pointsCorrect: 'Respuesta correcta',
      pointsWrong: {
        label: 'Respuesta incorrecta',
        hint: 'Introduce un numero negativo para restar puntos',
      },
      sounds: 'Sonidos',
      playSounds: 'Reproducir sonidos',
      beepAt: 'Iniciar pitido de cuenta atrás en',
    },

    action: {
      ok: 'Ok',
    },
  },
};
