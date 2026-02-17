export default {
  title: 'Dispositivos',

  item: {
    dongle: {
      find: 'Parpadea todos los controles',
      history: 'Restaurar el estado de un controlador desconectado',
    },

    controller: {
      disable: 'Deshabilitar controlador',
      edit: 'Editar Nombre',
      enable: 'Habilitar controlador',
      find: 'Parpadear controlador',
    },

    noEntries: {
      label: 'No hay dispositivos conectados',
      caption: 'Por favor conecta el el adaptador al equipo.',
    },

    missing: {
      label: '¿El dispositivo no aparece?',
      button: 'Ayuda',
    },

    test: {
      label: 'Testear todos los buzzers',
      button: 'Empezar',
    },

    names: {
      label: 'Actualizar los nombres de los controladores',
      button: 'Actualizar',
    },
  },

  edit: {
    title: 'Nombre del controlador',

    action: {
      ok: 'Actualizar',
      cancel: 'Cancelar',
    },
  },

  test: {
    title: 'Testear Controladores',

    action: {
      complete: 'Finalizado',
      cancel: 'Cancelar',
    },
  },

  names: {
    title: 'Actualizar los nombres de los controladores',
    description:
      'Todos los controladores recién conectados adoptarán los nombres mostrados aquí. ' +
      'Al reconectarse, los controladores pueden recibir nuevos nombres debido al hardware. ' +
      'limitaciones que impiden que algunos dongles se identifiquen de forma única.' +
      'Puedes restaurar el estado de dongles individuales usando el botón Historial',

    field: {
      label: 'Lista de nombres de controladores',
      hint: 'Un archivo .txt con un nombre por línea',
    },

    action: {
      save: 'Guardar',
      cancel: 'Cancelar',
    },
  },

  missing: {
    title: '¿El dispositivo no aparece?',
    description:
      'Es posible que los dispositivos Buzz de PlayStation 2 se este reconociendo como un concentrador USB dañado en lugar de un dispositivo HID. ' +
      'Sige estos pasos para actualizar el driver manualmente:',
    steps: {
      1: 'Abre el administrador de dispositivos',
      2: 'Bontón derecho sobre el dispositivo y luego sobre “Actualizar controlador”',
      3: 'Selecciona “Examinar mi pc en busca de controladores”',
      4: 'Selecciona “Elegir en luna listra de controladores disponibles en el equipo”',
      5: 'de la lista, selecciona “USB Input Device” o “USB HID Device” pulsa en “Aceptar”',
    },

    action: {
      ok: 'OK',
    },
  },

  restore: {
    title: 'Restaurar dongle',
    description:
      'Seleccione el dongle original al que se debe restaurar este dongle.',
    action: {
      cancel: 'Cancelar',
      restore: 'Restaurar',
      select: 'Seleccionar dongle',
    },
  },
};
