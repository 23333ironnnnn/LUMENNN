const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const LumenEngine = require('../engine/index');

let mainWindow = null;
let engine = null;

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

// Initialize engine and register IPC handlers
function initEngine() {
  const dataDir = path.join(__dirname, '..', 'data');
  engine = new LumenEngine(dataDir).init();

  ipcMain.handle('chat', (_event, text) => {
    return engine.handleChat(text);
  });

  ipcMain.handle('sleep', () => {
    return engine.handleSleep();
  });

  ipcMain.handle('get-diary', () => {
    return engine.getDiary();
  });

  ipcMain.handle('get-engine-status', () => {
    return engine.getStatus();
  });
}

app.whenReady().then(() => {
  initEngine();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
