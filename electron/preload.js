const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumenAPI', {
  chat: (text) => ipcRenderer.invoke('chat', text),
  sleep: () => ipcRenderer.invoke('sleep'),
  getDiary: () => ipcRenderer.invoke('get-diary'),
  getEngineStatus: () => ipcRenderer.invoke('get-engine-status'),
  // Window controls
  toggleChat: () => ipcRenderer.send('toggle-chat'),
  closePanel: () => ipcRenderer.send('close-panel'),
  // Listen for mode changes from main process
  onModeChange: (callback) => {
    ipcRenderer.on('mode-change', (_event, mode) => callback(mode));
  },
  // Drag support
  onDragStart: (x, y) => ipcRenderer.send('drag-start', x, y),
  onDragEnd: () => ipcRenderer.send('drag-end'),
});
