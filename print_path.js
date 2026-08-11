const { app } = require('electron');
app.whenReady().then(() => {
  console.log('UserData Path:', app.getPath('userData'));
  app.quit();
});
