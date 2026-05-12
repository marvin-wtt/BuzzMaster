export default {
  title: 'Pong',

  action: {
    start: 'Iniciar juego',
    pause: 'Pausar',
    resume: 'Reanudar',
    restart: 'Reiniciar',
    reset: 'Restablecer',
    settings: 'Ajustes',
    randomAssign: 'Equipos aleatorios',
  },

  team: {
    left: 'Izquierda',
    right: 'Derecha',
  },

  setup: {
    title: 'Configuración de equipos',
    hint: 'Asigna controles a los equipos y comienza',
    startHint: 'Ambos equipos necesitan al menos un control',
    noControllers: 'No hay controles conectados',
  },

  controls: {
    title: 'Controles',
    up: 'Mover arriba',
    down: 'Mover abajo',
    upButtons: 'Azul / Naranja',
    downButtons: 'Verde / Amarillo',
  },

  overlay: {
    paused: 'Pausado',
    gameOver: 'Juego terminado',
  },

  settings: {
    title: 'Ajustes de Pong',
    field: {
      rounds: 'Rondas para ganar',
      speed: 'Velocidad de la pelota',
      pointsForWin: 'Puntos para el equipo ganador',
    },
    speed: {
      slow: 'Lento',
      normal: 'Normal',
      fast: 'Rápido',
      turbo: 'Turbo',
    },
    action: {
      ok: 'Ok',
    },
  },
};
