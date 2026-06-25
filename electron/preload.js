const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumenAPI', {
  chat: (text) => ipcRenderer.invoke('chat', text),
  sleep: () => ipcRenderer.invoke('sleep'),
  getDiary: () => ipcRenderer.invoke('get-diary'),
  getEngineStatus: () => ipcRenderer.invoke('get-engine-status'),
  // Window panel control
  openPanel: (mode) => ipcRenderer.send('open-panel', mode),
  closePanel: () => ipcRenderer.send('close-panel'),
  // Listen for mode changes from main process
  onModeChange: (callback) => {
    ipcRenderer.on('mode-change', (_event, mode) => callback(mode));
  },
  // Window dragging
  dragStart: (offsetX, offsetY) => ipcRenderer.send('drag-start', offsetX, offsetY),
  dragMove: (screenX, screenY) => ipcRenderer.send('drag-move', screenX, screenY),
  dragEnd: () => ipcRenderer.send('drag-end'),
});
