export default {
  title: 'Devices',

  item: {
    dongle: {
      find: 'Flash all controllers',
      history: 'Restore the state of a disconnected controller',
    },

    controller: {
      disable: 'Disable controller',
      edit: 'Edit controller name',
      enable: 'Enable controller',
      find: 'Flash controller',
    },

    noEntries: {
      label: 'No devices connected',
      caption: 'Please connect a dongle to your computer.',
    },

    missing: {
      label: 'Device not showing up?',
      help: 'Help',
      add: 'Add',
    },

    test: {
      label: 'Test all buzzers',
      button: 'Start',
    },

    names: {
      label: 'Update controller names',
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
    title: 'Test controllers',

    action: {
      complete: 'Done',
      cancel: 'Cancel',
    },
  },

  names: {
    title: 'Update controller names',
    description:
      'All newly connected controllers will adopt the names listed here. ' +
      'Upon reconnection, controllers may receive new names due to hardware ' +
      'limitations that prevent some dongles from being uniquely identified. ' +
      'You can restore the state of individual dongles using the History button.',

    field: {
      label: 'Controller naming list',
      hint: 'A .txt file with one name per line',
    },

    action: {
      save: 'Save',
      cancel: 'Cancel',
    },
  },

  missing: {
    title: 'Controller not showing up?',
    description:
      'PlayStation 2 Buzz devices might be recognised as a malfunctioning USB hub instead of a HID device. ' +
      'Follow these steps to update the driver manually:',
    steps: {
      1: 'Open Device Manager',
      2: 'Right‑click the device and select “Update driver”',
      3: 'Choose “Browse my computer for drivers”',
      4: 'Select “Let me pick from a list of available drivers on my computer”',
      5: 'From the list, choose “USB Input Device” or “USB HID Device” and click “OK”',
    },

    action: {
      ok: 'OK',
    },
  },

  restore: {
    title: 'Restore dongle',
    description:
      'Select the original dongle that this dongle should be restored to.',
    action: {
      cancel: 'Cancel',
      restore: 'Restore',
      select: 'Select dongle',
    },
  },
};
