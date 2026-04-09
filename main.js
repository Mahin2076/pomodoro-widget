const { app, BrowserWindow } = require('electron');
const path = require('path');
require('dotenv').config();

function createWindow() {
  const win = new BrowserWindow({
    width: 200,
    height: 260,
    frame: false,
    transparent: true,
    alwaysOnTop: process.env.ALWAYS_ON_TOP !== 'false',
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
