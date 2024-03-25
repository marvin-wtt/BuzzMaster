export default {
  title: 'Devices',

  item: {
    test: {
      label: 'Test All Buzzers',
      button: 'Start',
    },

    names: {
      label: 'Controller naming list',
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
      'All newly connected controllers will be named according to the names in the given list. ' +
      'When a controller is disconnected and reconnected at a later stage, new names might be assigned to the controllers. ' +
      'This is because the app cannot uniquely identify some dongles due to hardware limitations.',

    field: {
      label: 'Controller naming list',
      hint: 'A .txt files with names separated by a new line',
    },

    action: {
      save: 'Save',
      cancel: 'Cancel',
    },
  },
};
