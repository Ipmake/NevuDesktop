import { contextBridge, ipcRenderer } from 'electron';

export interface PlatformInfo {
  platform: string;
  arch: string;
  version: string;
  appVersion: string;
}

export interface ServerInfo {
  name: string;
  url: string;
  version: string;
  plexServer: string;
  deploymentID: string;
}

export interface Settings {
  serverUrl: string;
  hardwareAcceleration: boolean;
}

interface DiscoveryAPI {
  getPlatform: () => Promise<PlatformInfo>;
  getDeviceName: () => Promise<string>;
  getWebViewPreloadPath: () => Promise<string>;
  getDiscoveredServers: () => Promise<ServerInfo[]>;
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  setServerUrl: (url: string) => Promise<boolean>;
  openSettings: () => Promise<boolean>;
  minimizeWindow: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  closeWindow: () => Promise<void>;
  closeSettings: () => Promise<void>;
  checkServerHealth: (url: string) => Promise<boolean>;
  resetServerUrl: () => Promise<boolean>;
  resetAllSettings: () => Promise<boolean>;
  refreshDiscovery: () => Promise<boolean>;
  onServerDiscovered: (callback: (server: ServerInfo) => void) => () => void;
  onServerRemoved: (callback: (url: string) => void) => () => void;
  onDiscoveryCleared: (callback: () => void) => () => void;
  onSettingsReset: (callback: () => void) => () => void;
  onServerUrlReset: (callback: () => void) => () => void;
  onServerUrlChanged: (callback: (url: string) => void) => () => void;
}

const api: DiscoveryAPI = {
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getDeviceName: () => ipcRenderer.invoke('get-device-name'),
  getWebViewPreloadPath: () => ipcRenderer.invoke('get-webview-preload-path'),
  getDiscoveredServers: () => ipcRenderer.invoke('get-discovered-servers'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Settings) => ipcRenderer.invoke('save-settings', settings),
  setServerUrl: (url: string) => ipcRenderer.invoke('set-server-url', url),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  toggleMaximize: () => ipcRenderer.invoke('toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  closeSettings: () => ipcRenderer.invoke('close-settings'),
  checkServerHealth: (url: string) => ipcRenderer.invoke('check-server-health', url),
  resetServerUrl: () => ipcRenderer.invoke('reset-server-url'),
  resetAllSettings: () => ipcRenderer.invoke('reset-all-settings'),
  refreshDiscovery: () => ipcRenderer.invoke('refresh-discovery'),
  onServerDiscovered: (callback: (server: ServerInfo) => void) => {
    const listener = (event: Electron.IpcRendererEvent, server: ServerInfo) => callback(server);
    ipcRenderer.on('server-discovered', listener);
    return () => ipcRenderer.removeListener('server-discovered', listener);
  },
  onServerRemoved: (callback: (url: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, url: string) => callback(url);
    ipcRenderer.on('server-removed', listener);
    return () => ipcRenderer.removeListener('server-removed', listener);
  },
  onSettingsReset: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('settings-reset', listener);
    return () => ipcRenderer.removeListener('settings-reset', listener);
  },
  onServerUrlReset: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('server-url-reset', listener);
    return () => ipcRenderer.removeListener('server-url-reset', listener);
  },
  onServerUrlChanged: (callback: (url: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, url: string) => callback(url);
    ipcRenderer.on('server-url-changed', listener);
    return () => ipcRenderer.removeListener('server-url-changed', listener);
  },
  onDiscoveryCleared: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('discovery-cleared', listener);
    return () => ipcRenderer.removeListener('discovery-cleared', listener);
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: DiscoveryAPI;
  }
}
