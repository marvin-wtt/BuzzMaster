export default {
  title: 'Apparaten',
  item: {
    dongle: {
      find: 'Laat alle controllers knipperen',
      history: 'Herstel de status van een losgekoppelde controller',
    },
    controller: {
      disable: 'Controller uitschakelen',
      edit: 'Naam controller bewerken',
      enable: 'Controller inschakelen',
      find: 'Laat controller knipperen',
    },
    noEntries: {
      label: 'Geen apparaten verbonden',
      caption: 'Sluit een dongle aan op je computer.',
    },
    missing: {
      label: 'Apparaat niet zichtbaar?',
      help: 'Help',
      add: 'Toevoegen',
    },
    test: {
      label: 'Test alle buzzers',
      button: 'Start',
    },
    names: {
      label: 'Controllernamen bijwerken',
      button: 'Bijwerken',
    },
  },
  edit: {
    title: 'Naam controller',
    action: {
      ok: 'Bijwerken',
      cancel: 'Annuleren',
    },
  },
  test: {
    title: 'Test controllers',
    action: {
      complete: 'Klaar',
      cancel: 'Annuleren',
    },
  },
  names: {
    title: 'Controllernamen bijwerken',
    description:
      'Alle nieuw verbonden controllers nemen de namen uit deze lijst over. Bij het opnieuw verbinden kunnen controllers nieuwe namen krijgen vanwege hardwarebeperkingen, waardoor sommige dongles niet uniek geïdentificeerd kunnen worden. Je kunt de status van individuele dongles herstellen via de Herstel-knop.',
    field: {
      label: 'Controllernamenlijst',
      hint: 'Een .txt-bestand met één naam per regel',
    },
    action: {
      save: 'Opslaan',
      cancel: 'Annuleren',
    },
  },
  missing: {
    title: 'Controller niet zichtbaar?',
    description:
      'PlayStation 2 Buzz-apparaten worden soms herkend als een defecte USB-hub in plaats van een HID-apparaat. Volg deze stappen om het stuurprogramma handmatig bij te werken:',
    steps: {
      '1': 'Open Apparaatbeheer',
      '2': 'Klik met de rechtermuisknop op het apparaat en selecteer “Stuurprogramma bijwerken”',
      '3': "Kies “Op mijn computer naar stuurprogramma's zoeken”",
      '4': "Selecteer “Ik wil kiezen uit een lijst met stuurprogramma's op mijn computer”",
      '5': 'Kies uit de lijst “USB-invoerapparaat” of “USB HID-apparaat” en klik op “OK”',
    },
    action: {
      ok: 'OK',
    },
  },
  restore: {
    title: 'Dongle herstellen',
    description:
      'Selecteer de oorspronkelijke dongle waarnaar deze dongle moet worden hersteld.',
    action: {
      cancel: 'Annuleren',
      restore: 'Herstellen',
      select: 'Selecteer dongle',
    },
  },
};
