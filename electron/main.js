const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Keep reference to prevent GC
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 160,
    height: 180,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.setPosition(
    require('electron').screen.getPrimaryDisplay().workAreaSize.width - 200,
    require('electron').screen.getPrimaryDisplay().workAreaSize.height - 220
  );
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
