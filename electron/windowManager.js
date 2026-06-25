const { BrowserWindow, screen } = require('electron');
const path = require('path');

const MINI_WIDTH = 160;
const MINI_HEIGHT = 180;

class WindowManager {
  constructor() {
    this.window = null;
    this.chatOpen = false;
  }

  createWindow() {
    const display = screen.getPrimaryDisplay().workAreaSize;
    this.window = new BrowserWindow({
      width: MINI_WIDTH,
      height: MINI_HEIGHT,
      x: display.width - MINI_WIDTH - 20,
      y: display.height - MINI_HEIGHT - 40,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      hasShadow: false,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.window.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

    return this.window;
  }

  // Expand window to fit chat panel
  openChat() {
    if (!this.window || this.chatOpen) return;
    this.chatOpen = true;
    const [x, y] = this.window.getPosition();
    this.window.setBounds({
      width: MINI_WIDTH + 360,
      height: Math.max(MINI_HEIGHT, 500),
      x: Math.max(0, x - 360 + MINI_WIDTH),
      y: Math.max(0, y - 160),
    });
    this.window.webContents.send('mode-change', 'chat');
  }

  // Shrink back to mini
  closeChat() {
    if (!this.window || !this.chatOpen) return;
    this.chatOpen = false;
    const [x, y] = this.window.getPosition();
    this.window.setBounds({
      width: MINI_WIDTH,
      height: MINI_HEIGHT,
      x: x + 360 - MINI_WIDTH,
      y: y + 160,
    });
    this.window.webContents.send('mode-change', 'mini');
  }

  // Toggle chat panel
  toggleChat() {
    if (this.chatOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
}

module.exports = WindowManager;
