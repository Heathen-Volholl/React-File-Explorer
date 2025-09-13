const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  readDirectory: (path) => ipcRenderer.invoke('fs:readdir', path),
  getFileStats: (path) => ipcRenderer.invoke('fs:stat', path),
  getDrives: () => ipcRenderer.invoke('fs:drives'),
  getHome: () => ipcRenderer.invoke('fs:home'),
  getSpecialFolders: () => ipcRenderer.invoke('fs:special-folders'),
  
  // File operations
  copyFile: (source, dest) => ipcRenderer.invoke('fs:copy', source, dest),
  moveFile: (source, dest) => ipcRenderer.invoke('fs:move', source, dest),
  deleteFile: (path) => ipcRenderer.invoke('fs:delete', path),
  createDirectory: (path) => ipcRenderer.invoke('fs:mkdir', path),
  
  // System operations
  openFile: (path) => ipcRenderer.invoke('fs:open', path),
  showInFolder: (path) => ipcRenderer.invoke('fs:show-in-folder', path),
  
  // Search
  searchWindows: (query, searchPath) => ipcRenderer.invoke('search:windows', query, searchPath),
  
  // Platform info
  platform: process.platform
});