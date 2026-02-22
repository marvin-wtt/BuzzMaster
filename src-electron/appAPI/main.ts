import { app, ipcMain } from 'electron';
import Store from 'electron-store';

export default () => {
  const store = new Store({
    schema: {
      locale: {
        type: 'string',
      },
    },
  });

  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getLocale', () =>
    store.get('locale', app.getSystemLocale()),
  );
  ipcMain.on('app:setLocale', (_, locale) => {
    store.set('locale', locale);
  });
};
