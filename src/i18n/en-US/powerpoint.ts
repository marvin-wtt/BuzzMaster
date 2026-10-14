export default {
  status: {
    loading: 'Connecting to PowerPoint…',
    unavailable: 'BuzzMaster add-in unavailable',
  },

  config: {
    tooNarrow:
      'This element is narrower than {min}px. The cast may not display correctly — make it wider on the slide.',
    title: 'Settings',
    close: 'Close',
    saved: 'Settings saved',
    gameMode: 'Game mode',
    noGame: 'Choose a game mode to configure this element.',
  },

  appearance: {
    title: 'Appearance',
    dark: 'Dark',
    light: 'Light',
    background: 'Background',
    backgroundTheme: 'Match theme',
    backgroundCustom: 'Custom colour',
    colour: 'Colour',
    colourInvalid: 'Use a hex colour like #1d2430',
  },

  connection: {
    disabled: 'PowerPoint integration is switched off',
    disabledHelp:
      'Open BuzzMaster, then enable the PowerPoint integration in its settings.',
    connecting: 'Connecting to BuzzMaster…',
    connected: 'BuzzMaster connected',
    disconnected: "BuzzMaster isn't running. Open BuzzMaster to use this game.",
    incompatible:
      'This PowerPoint integration requires a different version of BuzzMaster.',
    error: 'Could not reach BuzzMaster.',
  },

  presentation: {
    preparing: 'Preparing…',
    activationFailed: 'Could not prepare the game.',
    controllers: 'no controllers | 1 controller | {count} controllers',
    prepare: 'Prepare game',
    notConfigured: 'No game configured for this element.',
  },
};
