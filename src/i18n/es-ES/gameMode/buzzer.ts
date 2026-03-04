export default {
  title: 'Pulsador',

  waitingForBuzzer: 'Esperando pulsador...',
  controllersReady: '{count} controladores listos!',

  action: {
    start: 'Empezar',
    settings: 'Ajustes',
    reOpen: 'Re-abrir',
    quickPlay: 'Juego Rapido',
    reset: 'Reiniciar',
    cancel: 'Cancelar',
  },

  settings: {
    title: 'Ajustes',

    field: {
      answerTime: 'Tiempo de respuesta',
      multipleAttempts: 'Permitir múltiples intentos por equipo',
      playSounds: 'Reproducir sonidos',
      beepAt: 'Iniciar pitido de cuenta atrás en',
      points: 'Puntos',
      pointsCorrect: 'Respuesta Correcta',
      pointsWrong: {
        label: 'Respuesta Incorrecta',
        hint: 'Introduce un número negativo para restar puntos',
      },
    },

    action: {
      ok: 'Ok',
    },
  },
};
