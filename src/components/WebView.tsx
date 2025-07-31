import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface WebViewProps {
  serverUrl: string;
  onBackToSetup: () => void;
}

const WebView: React.FC<WebViewProps> = ({ serverUrl, onBackToSetup }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [webViewPreloadPath, setWebViewPreloadPath] = useState('');

  useEffect(() => {
    // Get the webview preload path
    const getPreloadPath = async () => {
      try {
        const path = await window.electronAPI.getWebViewPreloadPath();
        setWebViewPreloadPath(path);
      } catch (error) {
        console.error('Failed to get webview preload path:', error);
      }
    };
    
    getPreloadPath();
  }, []);

  useEffect(() => {
    if (serverUrl) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      // Simulate loading state
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [serverUrl]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to connect to the Nevu server. Please check your connection and try again.');
  };

  if (!serverUrl) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          No Server URL Configured
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
          Please configure a server URL in settings or return to setup to discover servers.
        </Typography>
        <Button variant="contained" onClick={onBackToSetup}>
          Back to Setup
        </Button>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Connection Error
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', maxWidth: 400 }}>
          {errorMessage}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onBackToSetup} startIcon={<ArrowBack />}>
            Back to Setup
          </Button>
          <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <CircularProgress size={64} sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Connecting to Nevu Server
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Loading {serverUrl}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Web Content Area - Full Screen */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Use webview tag for proper Electron webview with navigation support */}
        <webview
          src={serverUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#000000',
          }}
          allowpopups
          webpreferences={`allowRunningInsecureContent=true, webSecurity=false${webViewPreloadPath ? `, preload=${webViewPreloadPath}` : ''}`}
          disablewebsecurity
          preload={webViewPreloadPath}
          partition="persist:nevu"
        />
      </Box>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1">Loading Nevu...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default WebView;
