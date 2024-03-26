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
};
