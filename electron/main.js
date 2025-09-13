import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import path from 'path';
import { promises as fs, constants as fsConstants } from 'fs';
import fsSync from 'fs';
import { spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let clipboardWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'default',
    show: false
  });

  // Set up custom context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Clipboard Manager',
      click: () => {
        if (clipboardWindow && !clipboardWindow.isDestroyed()) {
          clipboardWindow.focus();
          return;
        }
        clipboardWindow = new BrowserWindow({
          width: 900,
          height: 700,
          minWidth: 600,
          minHeight: 400,
          parent: mainWindow,
          modal: false,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
          },
          title: 'Clipboard Manager',
        });
        // Load the same app, but you may want to load a dedicated route/component
        const isDev = process.env.NODE_ENV === 'development' || 
                      process.argv.includes('--dev') || 
                      !app.isPackaged ||
                      process.env.ELECTRON_IS_DEV === 'true';
        if (isDev) {
          clipboardWindow.loadURL('http://localhost:5173?clipgenius').catch(() => {
            clipboardWindow.loadFile(path.join(__dirname, '../index.html'));
          });
        } else {
          clipboardWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        }
        clipboardWindow.on('closed', () => {
          clipboardWindow = null;
        });
      }
    },
    { type: 'separator' },
    { role: 'copy' },
    { role: 'cut' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]);

  mainWindow.webContents.on('context-menu', (e, params) => {
    contextMenu.popup({ window: mainWindow });
  });

  // Load the app - check multiple ways to detect development
  const isDev = process.env.NODE_ENV === 'development' || 
                process.argv.includes('--dev') || 
                !app.isPackaged ||
                process.env.ELECTRON_IS_DEV === 'true';
  
  console.log('Development mode:', isDev); // Debug log
  
  if (isDev) {
    // Development mode - load from Vite dev server
    console.log('Loading from dev server...');
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      console.error('Failed to load dev server:', err);
      // Fallback if dev server isn't running
      console.log('Dev server not found, trying to load local file...');
      mainWindow.loadFile(path.join(__dirname, '../index.html'));
    });
    // Open dev tools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load built files
    console.log('Loading from built files...');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Utility function
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// IPC Handlers for File System Operations

// Get directory contents
ipcMain.handle('fs:readdir', async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const results = [];
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      let stats;
      
      try {
        stats = await fs.stat(fullPath);
      } catch (error) {
        continue; // Skip files we can't access
      }
      
      results.push({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        size: item.isFile() ? formatFileSize(stats.size) : null,
        modified: stats.mtime.toLocaleDateString(),
        fullPath: fullPath,
        isHidden: item.name.startsWith('.'),
        extension: item.isFile() ? path.extname(item.name).toLowerCase() : null
      });
    }
    
    // Sort: directories first, then files, alphabetically
    return results.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
});

// Get file stats
ipcMain.handle('fs:stat', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: formatFileSize(stats.size),
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString(),
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile()
    };
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
});

// Get system drives (Windows)
ipcMain.handle('fs:drives', async () => {
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      const drives = [];
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let pending = letters.length;
      
      for (const letter of letters) {
        const drivePath = `${letter}:\\`;
        fsSync.access(drivePath, fsConstants.F_OK, (err) => {
          if (!err) {
            drives.push({
              name: `Local Disk (${letter}:)`,
              path: drivePath,
              type: 'drive'
            });
          }
          pending--;
          if (pending === 0) {
            resolve(drives.sort((a, b) => a.path.localeCompare(b.path)));
          }
        });
      }
    });
  } else {
    // Unix-like systems
    return [{ name: 'Root', path: '/', type: 'drive' }];
  }
});

// Get home directory
ipcMain.handle('fs:home', () => {
  return os.homedir();
});

// Get special folders
ipcMain.handle('fs:special-folders', () => {
  const home = os.homedir();
  return {
    home,
    desktop: path.join(home, 'Desktop'),
    documents: path.join(home, 'Documents'),
    downloads: path.join(home, 'Downloads'),
    pictures: path.join(home, 'Pictures'),
    music: path.join(home, 'Music'),
    videos: path.join(home, 'Videos')
  };
});

// Windows Search integration
ipcMain.handle('search:windows', async (event, query, searchPath = 'C:\\') => {
  if (process.platform !== 'win32') {
    throw new Error('Windows Search is only available on Windows');
  }
  
  return new Promise((resolve, reject) => {
    // Use PowerShell to search with Windows Search
    const powershellCommand = `
      Get-ChildItem -Path "${searchPath}" -Recurse -ErrorAction SilentlyContinue | 
      Where-Object { $_.Name -like "*${query}*" } | 
      Select-Object Name, FullName, Length, LastWriteTime, @{Name="Type";Expression={if($_.PSIsContainer){"Directory"}else{"File"}}} |
      ConvertTo-Json
    `;
    
    const powershell = spawn('powershell', ['-Command', powershellCommand], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    powershell.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    powershell.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    powershell.on('close', (code) => {
      if (code === 0 && output.trim()) {
        try {
          const results = JSON.parse(output);
          const formatted = (Array.isArray(results) ? results : [results])
            .filter(item => item && item.FullName)
            .slice(0, 50) // Limit results
            .map(item => ({
              name: item.Name,
              fullPath: item.FullName,
              type: item.Type.toLowerCase(),
              size: item.Type === 'File' && item.Length ? formatFileSize(item.Length) : null,
              modified: item.LastWriteTime ? new Date(item.LastWriteTime).toLocaleDateString() : null
            }));
          resolve(formatted);
        } catch (parseError) {
          reject(new Error('Failed to parse search results'));
        }
      } else {
        reject(new Error(error || 'Search failed'));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      powershell.kill();
      reject(new Error('Search timeout'));
    }, 30000);
  });
});

// File operations
ipcMain.handle('fs:copy', async (event, sourcePath, destPath) => {
  try {
    await fs.copyFile(sourcePath, destPath);
    return true;
  } catch (error) {
    throw new Error(`Copy failed: ${error.message}`);
  }
});

ipcMain.handle('fs:move', async (event, sourcePath, destPath) => {
  try {
    await fs.rename(sourcePath, destPath);
    return true;
  } catch (error) {
    throw new Error(`Move failed: ${error.message}`);
  }
});

ipcMain.handle('fs:delete', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await fs.rmdir(filePath, { recursive: true });
    } else {
      await fs.unlink(filePath);
    }
    return true;
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
});

ipcMain.handle('fs:mkdir', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    throw new Error(`Create directory failed: ${error.message}`);
  }
});

// Open file with default application
ipcMain.handle('fs:open', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return true;
  } catch (error) {
    throw new Error(`Open failed: ${error.message}`);
  }
});

// Show file in explorer
ipcMain.handle('fs:show-in-folder', async (event, filePath) => {
  shell.showItemInFolder(filePath);
});