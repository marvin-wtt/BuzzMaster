export default {
  title: 'Geräte',

  item: {
    noEntries: {
      label: 'Keine verbundenen Controller',
      caption: 'Verbinden Sie ein Dongle mit Ihrem Computer',
    },

    test: {
      label: 'Alle Buzzer testen',
      button: 'Start',
    },

    names: {
      label: 'Controller-Namen aktualisieren',
      button: 'Aktualisieren',
    },

    missing: {
      label: 'Gerät wird nicht angezeigt?',
      button: 'Hilfe',
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

  missing: {
    title: 'Controller wird nicht angezeigt?',
    description:
      'PlayStation 2 Buzz‑Geräte werden möglicherweise als fehlerhafter USB‑Hub statt als HID‑Gerät erkannt. Führen Sie die folgenden Schritte aus, um den Treiber manuell zu aktualisieren:',
    steps: {
      1: 'Geräte-Manager öffnen',
      2: 'Mit der rechten Maustaste auf das Gerät klicken und „Treiber aktualisieren“ wählen',
      3: '„Auf dem Computer nach Treibersoftware suchen“ auswählen',
      4: '„Aus einer Liste verfügbarer Treiber auf meinem Computer auswählen“ wählen',
      5: 'In der Treiberliste „USB‑Eingabegerät“ oder „USB‑HID‑Gerät“ auswählen und auf „OK“ klicken',
    },
    action: {
      ok: 'OK',
    },
  },
};
