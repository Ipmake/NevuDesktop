/// <reference path="./types/global.d.ts" />

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import TitleBar from './components/TitleBar';
import Setup from './components/Setup';
import Settings from './components/Settings';
import WebView from './components/WebView';
import ServerHealthError from './components/ServerHealthError';
import { ServerInfo, Settings as SettingsType } from './types';

import '@fontsource-variable/inter'; // Import Inter variable font

const App: React.FC = () => {
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState('');
  const [discoveredServers, setDiscoveredServers] = useState<ServerInfo[]>([]);
  const [serverHealthError, setServerHealthError] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [settings, setSettings] = useState<SettingsType>({
    serverUrl: '',
    hardwareAcceleration: true,
  });

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        // Get current settings
        const currentSettings = await window.electronAPI.getSettings();
        setSettings(currentSettings);
        setCurrentServerUrl(currentSettings.serverUrl);
        
        // If we have a server URL, skip setup
        if (currentSettings.serverUrl) {
          setIsCheckingHealth(true);
          const isHealthy = await window.electronAPI.checkServerHealth(currentSettings.serverUrl);
          setIsCheckingHealth(false);
          
          if (isHealthy) {
            setIsSetupMode(false);
          } else {
            setServerHealthError(true);
            // Keep in setup mode to show error message
          }
        }

        // Get discovered servers
        const servers = await window.electronAPI.getDiscoveredServers();
        setDiscoveredServers(servers);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();

    // Listen for server discovery events
    const unsubscribeDiscovered = window.electronAPI.onServerDiscovered((server) => {
      setDiscoveredServers(prev => {
        const exists = prev.find(s => s.url === server.url);
        if (!exists) {
          return [...prev, server];
        }
        return prev;
      });
    });

    const unsubscribeRemoved = window.electronAPI.onServerRemoved((url) => {
      setDiscoveredServers(prev => prev.filter(s => s.url !== url));
    });

    const unsubscribeDiscoveryCleared = window.electronAPI.onDiscoveryCleared(() => {
      setDiscoveredServers([]);
    });

    return () => {
      unsubscribeDiscovered();
      unsubscribeRemoved();
      unsubscribeDiscoveryCleared();
    };
  }, []);

  const handleServerSelect = async (url: string) => {
    try {
      await window.electronAPI.setServerUrl(url);
      setCurrentServerUrl(url);
      setIsSetupMode(false);
    } catch (error) {
      console.error('Failed to set server URL:', error);
    }
  };

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsSave = async (newSettings: SettingsType) => {
    try {
      await window.electronAPI.saveSettings(newSettings);
      setSettings(newSettings);
      
      // If server URL changed, update current URL and exit setup if needed
      if (newSettings.serverUrl !== settings.serverUrl) {
        setCurrentServerUrl(newSettings.serverUrl);
        if (newSettings.serverUrl) {
          setIsSetupMode(false);
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleBackToSetup = () => {
    setIsSetupMode(true);
    setServerHealthError(false);
  };

  const handleResetServer = async () => {
    try {
      await window.electronAPI.resetServerUrl();
      setCurrentServerUrl('');
      setServerHealthError(false);
      setIsSetupMode(true);
      // Reload settings to reflect the change
      const currentSettings = await window.electronAPI.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to reset server URL:', error);
    }
  };

  const handleRetryServerCheck = async () => {
    if (!currentServerUrl) return;
    
    setIsCheckingHealth(true);
    setServerHealthError(false);
    
    try {
      const isHealthy = await window.electronAPI.checkServerHealth(currentServerUrl);
      if (isHealthy) {
        setIsSetupMode(false);
        setServerHealthError(false);
      } else {
        setServerHealthError(true);
      }
    } catch (error) {
      console.error('Failed to check server health:', error);
      setServerHealthError(true);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <TitleBar onSettingsClick={handleSettingsOpen} />
      
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {serverHealthError ? (
          <ServerHealthError
            serverUrl={currentServerUrl}
            isChecking={isCheckingHealth}
            onResetServer={handleResetServer}
            onOpenSettings={handleSettingsOpen}
            onRetryCheck={handleRetryServerCheck}
          />
        ) : isSetupMode ? (
          <Setup
            discoveredServers={discoveredServers}
            onServerSelect={handleServerSelect}
          />
        ) : (
          <WebView
            serverUrl={currentServerUrl}
            onBackToSetup={handleBackToSetup}
          />
        )}
      </Box>

      {isSettingsOpen && (
        <Settings
          open={isSettingsOpen}
          settings={settings}
          onClose={handleSettingsClose}
          onSave={handleSettingsSave}
        />
      )}
    </Box>
  );
};

export default App;
