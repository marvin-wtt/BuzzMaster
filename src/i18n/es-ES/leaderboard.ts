export default {
  title: 'Clasificación',

  noEntries: '¡No hay ningún buzzer activo disponible!',

  action: {
    reset: 'Resetear',
    ok: 'Ok',
  },

  update: {
    title: 'Actualizar {name}',

    field: {
      label: 'Puntos',
      hint: 'Nuevos Puntos: {points}',
    },

    rule: {
      onlyNumbers: 'Solo se permiten caracteres numericos',
      missingOperand: 'Falta símbolo (ejemp. +2)',
      divZero: 'No se puede dividir por cero',
    },

    action: {
      submit: 'Actualizar',
      cancel: 'Cancelar',
    },
  },

  reset: {
    title: 'Reiniciar Puntos',
    message: '¿Deseas reiniciar todos los puntos de todos los controles?',

    action: {
      ok: 'Resetear',
      cancel: 'Cancelar',
    },
  },
};
