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

export interface PlatformInfo {
  platform: string;
  arch: string;
  version: string;
  appVersion: string;
}
