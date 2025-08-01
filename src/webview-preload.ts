import { contextBridge, ipcRenderer } from 'electron';

export interface PlatformInfo {
  platform: string;
  arch: string;
  version: string;
  appVersion: string;
}

// Limited API for webview - only expose platform functions that Nevu needs
interface WebViewElectronAPI {
  getPlatform: () => Promise<PlatformInfo>;
  getDeviceName: () => Promise<string>;
  // Add other safe functions that the webview needs access to
}

const webViewAPI: WebViewElectronAPI = {
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getDeviceName: () => ipcRenderer.invoke('get-device-name'),
};

// Expose the API to the webview context
contextBridge.exposeInMainWorld('electronAPI', webViewAPI);

// Don't declare global interface to avoid conflicts with main preload
