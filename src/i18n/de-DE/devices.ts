export default {
  title: 'Geräte',

  item: {
    test: {
      label: 'Alle Buzzer testen',
      button: 'Start',
    },

    names: {
      label: 'Controller-Namensliste',
      button: 'Aktualisieren',
    },
  },

  test: {
    title: 'Controllers testen',

    action: {
      complete: 'Fertig',
      cancel: 'Abbrechen',
    },
  },

  edit: {
    title: 'Controller Name',

    action: {
      ok: 'Aktualisieren',
      cancel: 'Abbrechen',
    },
  },

  names: {
    title: 'Controller-Namen aktualisieren',
    description:
      'Alle neu verbundenen Controller übernehmen die Namen, die hier ' +
      'aufgeführt sind. Beim erneuten Anschließen können Controller aufgrund ' +
      'von Hardwarebeschränkungen möglicherweise neue Namen erhalten, da ' +
      'einige Dongles nicht eindeutig identifiziert werden können.',

    field: {
      label: 'Liste der Controller-Namen',
      hint: 'Eine .txt-Datei mit Namen, die durch Zeilenumbrüche getrennt sind',
    },

    action: {
      save: 'Speichern',
      cancel: 'Abbrechen',
    },
  },
};
