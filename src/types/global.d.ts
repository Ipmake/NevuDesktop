/// <reference types="electron" />
/// <reference path="./assets.d.ts" />

import { ServerInfo, Settings, PlatformInfo } from '../types';

declare global {
  interface Window {
    electronAPI: {
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
      // Auto updater functions
      checkForUpdates: () => Promise<boolean>;
      downloadUpdate: () => Promise<boolean>;
      installUpdate: () => Promise<boolean>;
      getUpdateInfo: () => Promise<{ version: string; isUpdateAvailable: boolean; isUpdateDownloaded: boolean }>;
      // Event listeners
      onServerDiscovered: (callback: (server: ServerInfo) => void) => () => void;
      onServerRemoved: (callback: (url: string) => void) => () => void;
      onDiscoveryCleared: (callback: () => void) => () => void;
      onSettingsReset: (callback: () => void) => () => void;
      onServerUrlReset: (callback: () => void) => () => void;
      onServerUrlChanged: (callback: (url: string) => void) => () => void;
      onUpdateProgress: (callback: (progress: { percent: number; transferred: number; total: number }) => void) => () => void;
    };
  }
}

export {};
