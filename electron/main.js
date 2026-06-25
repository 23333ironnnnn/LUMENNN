const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const LumenEngine = require('../engine/index');
const WindowManager = require('./windowManager');

let windowManager = null;
let engine = null;

function initEngine() {
  const dataDir = path.join(__dirname, '..', 'data');
  engine = new LumenEngine(dataDir).init();

  ipcMain.handle('chat', (_event, text) => engine.handleChat(text));
  ipcMain.handle('sleep', () => engine.handleSleep());
  ipcMain.handle('get-diary', () => engine.getDiary());
  ipcMain.handle('get-engine-status', () => engine.getStatus());

  // Window control IPC
  ipcMain.on('toggle-chat', () => windowManager.toggleChat());
  ipcMain.on('close-panel', () => {
    if (windowManager.chatOpen) windowManager.closeChat();
  });

  // Window dragging IPC
  ipcMain.on('drag-start', (_event, offsetX, offsetY) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    const [winX, winY] = win.getPosition();
    win._dragOffset = { offsetX: offsetX - winX, offsetY: offsetY - winY };
  });

  ipcMain.on('drag-move', (_event, screenX, screenY) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win || !win._dragOffset) return;
    win.setPosition(
      screenX - win._dragOffset.offsetX,
      screenY - win._dragOffset.offsetY
    );
  });

  ipcMain.on('drag-end', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win._dragOffset = null;
  });
}

app.whenReady().then(() => {
  initEngine();
  windowManager = new WindowManager();
  windowManager.createWindow();
});

app.on('window-all-closed', () => app.quit());
