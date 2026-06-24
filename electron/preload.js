const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumenAPI', {
  chat: (text) => ipcRenderer.invoke('chat', text),
  sleep: () => ipcRenderer.invoke('sleep'),
  getDiary: () => ipcRenderer.invoke('get-diary'),
  getEngineStatus: () => ipcRenderer.invoke('get-engine-status'),
});
