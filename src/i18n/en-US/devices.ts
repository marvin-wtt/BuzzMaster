export default {
  title: 'Devices',

  item: {
    noEntries: {
      label: 'No devices connected',
      caption: 'Please connect a dongle to your computer',
    },

    missing: {
      label: 'Device not showing up?',
      button: 'Help',
    },

    test: {
      label: 'Test All Buzzers',
      button: 'Start',
    },

    names: {
      label: 'Update Controller Names',
      button: 'Update',
    },
  },

  edit: {
    title: 'Controller name',

    action: {
      ok: 'Update',
      cancel: 'Cancel',
    },
  },

  test: {
    title: 'Test Controllers',

    action: {
      complete: 'Done',
      cancel: 'Cancel',
    },
  },

  names: {
    title: 'Update controller names',
    description:
      'All newly connected controllers will adopt names listed here. ' +
      'Upon reconnection, controllers may receive new names due to hardware limitations preventing unique ' +
      'identification of some dongles.',

    field: {
      label: 'Controller Naming List',
      hint: 'A .txt files with names separated by a new line',
    },

    action: {
      save: 'Save',
      cancel: 'Cancel',
    },
  },

  missing: {
    title: 'Controller not showing up?',
    description:
      'Playstation 2 Buzz devices might be recognised as a malfunctioning USB-hub instead of a HID-Device. ' +
      'Follow these steps to update the driver manually:',
    steps: {
      1: 'Open Device Manager',
      2: 'Right-click on the device and select "Update Driver"',
      3: 'Select "Browse my computer for driver software"',
      4: 'Select "Let me pick from a list of device drivers on my computer"',
      5: 'From the list of drivers, select "USB Input Device" or "USB HID Device" amd click "OK"',
    },

    action: {
      ok: 'Ok',
    },
  },
};
