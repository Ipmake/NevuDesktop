import { app, BrowserWindow, ipcMain, Menu, dialog, shell, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import { Discovery } from 'udp-discovery';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import * as os from 'os';

interface ServerInfo {
  name: string;
  url: string;
  version: string;
  plexServer: string;
  deploymentID: string;
}

interface StoreSchema {
  serverUrl: string;
  hardwareAcceleration: boolean;
  windowBounds: { width: number; height: number };
  maximized: boolean;
}

// Store for user preferences
const store = new Store<StoreSchema>({
  defaults: {
    serverUrl: '',
    hardwareAcceleration: true,
    windowBounds: { width: 1200, height: 800 },
    maximized: false
  }
});

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let discoveredServers: ServerInfo[] = [];
let discovery: Discovery | null = null;

// Auto updater events
autoUpdater.checkForUpdatesAndNotify();

// Single instance enforcement
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running, quit this one
  app.quit();
} else {
  // Handle second instance - focus the existing window
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Check if a Nevu server is accessible
function checkServerHealth(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: '/status',
        method: 'GET',
        timeout: 5000,
      };

      const req = httpModule.request(options, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

// Reset all settings to defaults
function resetAllSettings(): void {
  store.clear();
  if (mainWindow) {
    mainWindow.webContents.send('settings-reset');
    mainWindow.webContents.reload();
  }
}

function createMainWindow(): void {
  const bounds = store.get('windowBounds');
  const isMaximized = store.get('maximized');

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow redirects for Plex login
      webviewTag: true // Enable webview support
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  });

  // Set hardware acceleration preference
  if (!store.get('hardwareAcceleration')) {
    app.disableHardwareAcceleration();
  }

  // Always load our React app, let it handle server connections
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Development mode enhancements
  if (process.argv.includes('--dev')) {
    // Open DevTools
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      if (isMaximized) {
        mainWindow.maximize();
      }
    }
  });

  // Window state management
  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });

  mainWindow.on('maximize', () => {
    store.set('maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    store.set('maximized', false);
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = mainWindow?.webContents.getURL();
    
    if (currentUrl && parsedUrl.origin !== new URL(currentUrl).origin) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: mainWindow || undefined,
    modal: true,
    show: false,
    frame: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

  settingsWindow.once('ready-to-show', () => {
    if (settingsWindow) {
      settingsWindow.show();
    }
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// Discover Nevu servers on the network
function discoverServers(): void {
  discovery = new Discovery();
  
  discovery.on('available', (name, data) => {
    console.log('Discovery event - available:', { name, data });
    
    // Look for Nevu servers - they might announce with different names
    if (name === 'Nevu') {
      // Extract the correct address and port from the discovery data
      const address = data.addr;
      const port = data.data?.port || data.port || 3000;
      
      const server: ServerInfo = {
        name: name || 'Nevu Server',
        url: `http://${address}:${port}`,
        version: data.data?.txt?.version || data.txt?.version || data.version || 'Unknown',
        plexServer: data.data?.txt?.plexServer || data.txt?.plexServer || data.plexServer || 'Unknown',
        deploymentID: data.data?.txt?.deploymentID || data.txt?.deploymentID || data.deploymentID || 'Unknown'
      };
      
      if (!discoveredServers.find(s => s.url === server.url)) {
        discoveredServers.push(server);
        console.log('Discovered Nevu server:', server);
        if (mainWindow) {
          mainWindow.webContents.send('server-discovered', server);
        }
      }
    }
  });

  discovery.on('unavailable', (name: string, data: any) => {
    console.log('Discovery event - unavailable:', { name, data });
    
    if (name === 'Nevu' || name === 'nevu' || (data && (data.type === 'nevu' || data.service === 'nevu'))) {
      const address = data.addr || data.address || 'localhost';
      const port = data.data?.port || data.port || 3000;
      const url = `http://${address}:${port}`;
      discoveredServers = discoveredServers.filter(s => s.url !== url);
      console.log('Nevu server unavailable:', url);
      if (mainWindow) {
        mainWindow.webContents.send('server-removed', url);
      }
    }
  });

  discovery.on('error', (err: Error) => {
    console.error('UDP Discovery error:', err);
  });

  console.log('UDP Discovery initialized, listening for Nevu servers...');
}

// App event handlers
app.whenReady().then(() => {
  createMainWindow();
  discoverServers();

  // Register global shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+R', () => {
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: 'Reset All Settings',
        message: 'Are you sure you want to reset all settings to their defaults?',
        detail: 'This will clear your server URL, hardware acceleration settings, and window preferences. The application will restart.',
        buttons: ['Reset Settings', 'Cancel'],
        defaultId: 1,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          resetAllSettings();
          app.relaunch();
          app.exit();
        }
      });
    }
  });

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Nevu',
      submenu: [
        { label: 'About Nevu', role: 'about' },
        { type: 'separator' },
        { label: 'Settings...', accelerator: 'CmdOrCtrl+,', click: () => createSettingsWindow() },
        { type: 'separator' },
        { 
          label: 'Reset All Settings...', 
          accelerator: 'CmdOrCtrl+Shift+R', 
          click: () => {
            if (mainWindow) {
              dialog.showMessageBox(mainWindow, {
                type: 'question',
                title: 'Reset All Settings',
                message: 'Are you sure you want to reset all settings to their defaults?',
                detail: 'This will clear your server URL, hardware acceleration settings, and window preferences. The application will restart.',
                buttons: ['Reset Settings', 'Cancel'],
                defaultId: 1,
                cancelId: 1
              }).then((result) => {
                if (result.response === 0) {
                  resetAllSettings();
                  app.relaunch();
                  app.exit();
                }
              });
            }
          }
        },
        { type: 'separator' },
        { label: 'Hide Nevu', accelerator: 'CmdOrCtrl+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'CmdOrCtrl+Shift+H', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(process.platform === 'darwin' ? menu : null);
});

app.on('window-all-closed', () => {  
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {  
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('get-platform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.getSystemVersion(),
    appVersion: app.getVersion()
  };
});

ipcMain.handle('get-device-name', () => {
  return os.hostname();
});

ipcMain.handle('get-webview-preload-path', () => {
  return path.join(__dirname, 'webview-preload.js');
});

ipcMain.handle('get-discovered-servers', () => {
  return discoveredServers;
});

ipcMain.handle('get-settings', () => {
  return {
    serverUrl: store.get('serverUrl'),
    hardwareAcceleration: store.get('hardwareAcceleration')
  };
});

ipcMain.handle('save-settings', (event, settings: { serverUrl: string; hardwareAcceleration: boolean }) => {
  const currentHardwareAcceleration = store.get('hardwareAcceleration');
  
  store.set('serverUrl', settings.serverUrl);
  store.set('hardwareAcceleration', settings.hardwareAcceleration);
  
  if (settings.hardwareAcceleration !== currentHardwareAcceleration && mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Restart Required',
      message: 'Please restart Nevu for the hardware acceleration changes to take effect.',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        app.relaunch();
        app.exit();
      }
    });
  }
  
  return true;
});

ipcMain.handle('set-server-url', (event, url: string) => {
  store.set('serverUrl', url);
  // Don't navigate directly, let React app handle it
  if (mainWindow) {
    mainWindow.webContents.send('server-url-changed', url);
  }
  return true;
});

ipcMain.handle('open-settings', () => {
  createSettingsWindow();
  return true;
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('toggle-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

ipcMain.handle('check-server-health', async (event, url: string) => {
  return await checkServerHealth(url);
});

ipcMain.handle('reset-server-url', () => {
  store.delete('serverUrl');
  if (mainWindow) {
    mainWindow.webContents.send('server-url-reset');
  }
  return true;
});

ipcMain.handle('reset-all-settings', () => {
  resetAllSettings();
  app.relaunch();
  app.exit();
  return true;
});

ipcMain.handle('refresh-discovery', () => {
  // Clear current discovered servers and restart discovery
  discoveredServers = [];
  if (mainWindow) {
    mainWindow.webContents.send('discovery-cleared');
  }
  
  // Just rely on UDP discovery
  console.log('Discovery refreshed - relying on UDP discovery');
  return true;
});
