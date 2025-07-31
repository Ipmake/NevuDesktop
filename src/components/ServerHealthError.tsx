import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface ServerHealthErrorProps {
  serverUrl: string;
  isChecking: boolean;
  onResetServer: () => void;
  onOpenSettings: () => void;
  onRetryCheck: () => void;
}

const ServerHealthError: React.FC<ServerHealthErrorProps> = ({
  serverUrl,
  isChecking,
  onResetServer,
  onOpenSettings,
  onRetryCheck,
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        background: 'linear-gradient(135deg, #000000 0%, #111827 100%)',
        minHeight: '100%',
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon 
            sx={{ 
              fontSize: 64, 
              color: 'error.main', 
              mb: 2,
              filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))',
            }} 
          />
          
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Server Connection Failed
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Unable to connect to your configured Nevu server. The server might be offline or the URL might be incorrect.
          </Typography>

          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Configured Server:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {serverUrl}
            </Typography>
          </Alert>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Please check that your Nevu server is running and accessible on your network, or configure a different server.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isChecking ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Checking server...</Typography>
              </Box>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={onRetryCheck}
                  size="large"
                >
                  Retry Connection
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={onOpenSettings}
                    fullWidth
                  >
                    Change Server
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={onResetServer}
                    fullWidth
                  >
                    Reset Server
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ServerHealthError;
