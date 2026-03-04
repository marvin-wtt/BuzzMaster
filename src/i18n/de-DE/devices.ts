export default {
  title: 'Geräte',

  item: {
    dongle: {
      find: 'Alle Controller blinken lassen',
      history: 'Zustand eines getrennten Controllers wiederherstellen',
    },

    controller: {
      disable: 'Controller deaktivieren',
      edit: 'Controller‑Namen bearbeiten',
      enable: 'Controller aktivieren',
      find: 'Controller blinken lassen',
    },

    noEntries: {
      label: 'Keine Geräte verbunden',
      caption: 'Bitte schließe einen Dongle an deinen Computer an.',
    },

    missing: {
      label: 'Gerät wird nicht angezeigt?',
      help: 'Hilfe',
      add: 'Hinzufügen',
    },

    test: {
      label: 'Alle Buzzer testen',
      button: 'Start',
    },

    names: {
      label: 'Controller‑Namen aktualisieren',
      button: 'Aktualisieren',
    },
  },

  edit: {
    title: 'Controller‑Name',

    action: {
      ok: 'Aktualisieren',
      cancel: 'Abbrechen',
    },
  },

  test: {
    title: 'Controller testen',

    action: {
      complete: 'Fertig',
      cancel: 'Abbrechen',
    },
  },

  names: {
    title: 'Controller‑Namen aktualisieren',
    description:
      'Alle neu verbundenen Controller übernehmen die hier aufgeführten Namen. ' +
      'Beim erneuten Verbinden können Controller neue Namen erhalten, da einige Dongles aus Hardware‑Gründen nicht eindeutig identifiziert werden können. ' +
      'Du kannst den Zustand einzelner Dongles über die Schaltfläche „Verlauf“ wiederherstellen.',

    field: {
      label: 'Liste der Controller‑Namen',
      hint: 'Eine .txt‑Datei mit je einem Namen pro Zeile',
    },

    action: {
      save: 'Speichern',
      cancel: 'Abbrechen',
    },
  },

  missing: {
    title: 'Controller wird nicht angezeigt?',
    description:
      'PlayStation 2 Buzz‑Geräte können fälschlicherweise als defekter USB‑Hub statt als HID‑Gerät erkannt werden. ' +
      'So aktualisierst du den Treiber manuell:',
    steps: {
      1: 'Geräte‑Manager öffnen',
      2: 'Mit der rechten Maustaste auf das Gerät klicken und „Treiber aktualisieren“ wählen',
      3: '„Auf dem Computer nach Treibern suchen“ auswählen',
      4: '„Aus einer Liste verfügbarer Treiber auf meinem Computer auswählen“ wählen',
      5: 'In der Liste „USB‑Eingabegerät“ oder „USB‑HID‑Gerät“ auswählen und „OK“ klicken',
    },

    action: {
      ok: 'OK',
    },
  },

  restore: {
    title: 'Dongle wiederherstellen',
    description:
      'Wähle den ursprünglichen Dongle aus, auf den dieser Dongle zurückgesetzt werden soll.',
    action: {
      cancel: 'Abbrechen',
      restore: 'Wiederherstellen',
      select: 'Dongle auswählen',
    },
  },
};
