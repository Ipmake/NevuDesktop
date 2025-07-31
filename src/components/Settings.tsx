import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Close,
  Save,
} from '@mui/icons-material';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  open: boolean;
  settings: SettingsType;
  onClose: () => void;
  onSave: (settings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({
  open,
  settings,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleSettingChange = (key: keyof SettingsType, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(
      newSettings.serverUrl !== settings.serverUrl ||
      newSettings.hardwareAcceleration !== settings.hardwareAcceleration
    );
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
  };

  const handleClose = () => {
    window.electronAPI.closeSettings();
    onClose();
  };

  const isValidUrl = (url: string) => {
    if (!url) return true; // Empty URL is valid (will show setup)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          backgroundImage: 'none',
          minHeight: 500,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'surface.main',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Server Connection */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Server Connection
            </Typography>
            
            <TextField
              fullWidth
              label="Server URL"
              value={localSettings.serverUrl}
              onChange={(e) => handleSettingChange('serverUrl', e.target.value)}
              placeholder="http://localhost:3000"
              error={!isValidUrl(localSettings.serverUrl)}
              helperText={
                !isValidUrl(localSettings.serverUrl)
                  ? 'Please enter a valid URL'
                  : 'Enter the URL of your Nevu server'
              }
            />
          </Box>

          <Divider />

          {/* Keyboard Shortcuts */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Keyboard Shortcuts
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Open Settings</Typography>
                <Chip 
                  label="Ctrl+," 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Reset All Settings</Typography>
                <Chip 
                  label="Ctrl+Shift+R" 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Performance Settings */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Performance
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.hardwareAcceleration}
                  onChange={(e) => handleSettingChange('hardwareAcceleration', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Hardware Acceleration</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Uses GPU acceleration for better performance
                  </Typography>
                </Box>
              }
            />

            {localSettings.hardwareAcceleration !== settings.hardwareAcceleration && (
              <Alert severity="info" sx={{ mt: 2 }}>
                A restart is required for hardware acceleration changes to take effect.
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Advanced Settings */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Advanced
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Reset all settings including server URL, hardware acceleration preferences, and window state. 
                The application will restart after reset.
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  if (window.electronAPI) {
                    window.electronAPI.resetAllSettings();
                  }
                }}
              >
                Reset All Settings
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          disabled={!hasChanges || !isValidUrl(localSettings.serverUrl)}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Settings;
