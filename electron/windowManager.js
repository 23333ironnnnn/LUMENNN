const { BrowserWindow, screen } = require('electron');
const path = require('path');

const MINI_WIDTH = 53;  // 160 / 3 ≈ 53
const MINI_HEIGHT = 60; // 180 / 3 = 60

class WindowManager {
  constructor() {
    this.window = null;
    this.panelOpen = false;
    this.wanderInterval = null;
    this.wanderEnabled = true;
    this.currentEdge = 'bottom'; // bottom, right, top, left
    this.walkingDirection = 1; // 1 = forward, -1 = backward
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
      resizable: true, // 允许调整大小
      hasShadow: false,
      skipTaskbar: true,
      minWidth: 400, // 设置最小宽度
      minHeight: 300, // 设置最小高度
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.window.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

    // Start wandering after window is ready
    this.window.once('ready-to-show', () => {
      this.startWandering();
    });

    return this.window;
  }

  // Start desktop wandering - cat crawling along edges
  startWandering() {
    if (this.wanderInterval) return;

    const walk = () => {
      if (!this.wanderEnabled || this.panelOpen || !this.window) return;

      const display = screen.getPrimaryDisplay().workAreaSize;
      const [currentX, currentY] = this.window.getPosition();
      const [width, height] = this.window.getSize();

      // Determine which edge LUMEN is closest to
      const distToBottom = display.height - (currentY + height);
      const distToTop = currentY;
      const distToRight = display.width - (currentX + width);
      const distToLeft = currentX;

      const minDist = Math.min(distToBottom, distToTop, distToRight, distToLeft);

      // Snap to nearest edge
      if (minDist === distToBottom) this.currentEdge = 'bottom';
      else if (minDist === distToTop) this.currentEdge = 'top';
      else if (minDist === distToRight) this.currentEdge = 'right';
      else if (minDist === distToLeft) this.currentEdge = 'left';

      // Walk along the edge (30-80 pixels)
      const stepSize = 30 + Math.floor(Math.random() * 50);
      let newX = currentX;
      let newY = currentY;

      // 10% chance to turn corner
      const turnCorner = Math.random() < 0.1;

      if (this.currentEdge === 'bottom') {
        // Walk along bottom edge
        newY = display.height - height - 10;
        newX = currentX + (stepSize * this.walkingDirection);

        // Check bounds and turn corner
        if (newX < 0) {
          newX = 0;
          this.currentEdge = 'left';
          this.walkingDirection = 1;
        } else if (newX > display.width - width) {
          newX = display.width - width;
          this.currentEdge = 'right';
          this.walkingDirection = 1;
        } else if (turnCorner) {
          this.currentEdge = Math.random() < 0.5 ? 'left' : 'right';
          this.walkingDirection = 1;
        }
      } else if (this.currentEdge === 'top') {
        // Walk along top edge
        newY = 10;
        newX = currentX + (stepSize * this.walkingDirection);

        if (newX < 0) {
          newX = 0;
          this.currentEdge = 'left';
          this.walkingDirection = 1;
        } else if (newX > display.width - width) {
          newX = display.width - width;
          this.currentEdge = 'right';
          this.walkingDirection = 1;
        } else if (turnCorner) {
          this.currentEdge = Math.random() < 0.5 ? 'left' : 'right';
          this.walkingDirection = 1;
        }
      } else if (this.currentEdge === 'left') {
        // Walk along left edge
        newX = 10;
        newY = currentY + (stepSize * this.walkingDirection);

        if (newY < 0) {
          newY = 0;
          this.currentEdge = 'top';
          this.walkingDirection = 1;
        } else if (newY > display.height - height) {
          newY = display.height - height;
          this.currentEdge = 'bottom';
          this.walkingDirection = 1;
        } else if (turnCorner) {
          this.currentEdge = Math.random() < 0.5 ? 'top' : 'bottom';
          this.walkingDirection = 1;
        }
      } else if (this.currentEdge === 'right') {
        // Walk along right edge
        newX = display.width - width - 10;
        newY = currentY + (stepSize * this.walkingDirection);

        if (newY < 0) {
          newY = 0;
          this.currentEdge = 'top';
          this.walkingDirection = 1;
        } else if (newY > display.height - height) {
          newY = display.height - height;
          this.currentEdge = 'bottom';
          this.walkingDirection = 1;
        } else if (turnCorner) {
          this.currentEdge = Math.random() < 0.5 ? 'top' : 'bottom';
          this.walkingDirection = 1;
        }
      }

      // Smooth move
      this.window.setPosition(Math.floor(newX), Math.floor(newY), true);

      // Next step: 2-5 seconds (more frequent for natural walking)
      const nextStep = 2000 + Math.random() * 3000;
      this.wanderInterval = setTimeout(walk, nextStep);
    };

    // Start first walk after 10 seconds
    this.wanderInterval = setTimeout(walk, 10000);
  }

  // Stop wandering
  stopWandering() {
    this.wanderEnabled = false;
    if (this.wanderInterval) {
      clearTimeout(this.wanderInterval);
      this.wanderInterval = null;
    }
  }

  // Resume wandering
  resumeWandering() {
    this.wanderEnabled = true;
    this.startWandering();
  }

  // Expand window to fit any panel (chat, sleep, diary)
  openPanel(mode) {
    if (!this.window || this.panelOpen) return;
    this.panelOpen = true;
    const display = screen.getPrimaryDisplay().workAreaSize;

    // Calculate desired size for chat panel (500x500)
    let desiredWidth = MINI_WIDTH + 500; // MINI + ChatPanel width
    let desiredHeight = Math.max(MINI_HEIGHT, 500); // ChatPanel height

    // Center the window on screen
    const newX = Math.floor((display.width - desiredWidth) / 2);
    const newY = Math.floor((display.height - desiredHeight) / 2);

    this.window.setBounds({
      width: desiredWidth,
      height: desiredHeight,
      x: newX,
      y: newY,
    });
    this.window.webContents.send('mode-change', mode);
  }

  // Shrink back to mini
  closePanel() {
    if (!this.window || !this.panelOpen) return;
    this.panelOpen = false;
    const display = screen.getPrimaryDisplay().workAreaSize;
    // Return to bottom-right corner
    this.window.setBounds({
      width: MINI_WIDTH,
      height: MINI_HEIGHT,
      x: display.width - MINI_WIDTH - 20,
      y: display.height - MINI_HEIGHT - 40,
    });
    this.window.webContents.send('mode-change', 'mini');
  }
}

module.exports = WindowManager;
