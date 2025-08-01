import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
  Alert
} from '@mui/material';
import { Download, Update, CheckCircle } from '@mui/icons-material';

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
}

interface UpdateNotificationProps {
  onCheckForUpdates?: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onCheckForUpdates }) => {
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);

  useEffect(() => {
    // Listen for update progress
    const unsubscribeProgress = window.electronAPI?.onUpdateProgress((progress) => {
      setUpdateProgress(progress);
      setIsDownloading(true);
    });

    // Get initial update info
    const getUpdateInfo = async () => {
      try {
        const info = await window.electronAPI?.getUpdateInfo();
        setUpdateInfo(info);
      } catch (error) {
        console.error('Failed to get update info:', error);
      }
    };

    getUpdateInfo();

    return () => {
      unsubscribeProgress?.();
    };
  }, []);

  const handleCheckForUpdates = async () => {
    try {
      await window.electronAPI?.checkForUpdates();
      onCheckForUpdates?.();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      setIsDownloading(true);
      await window.electronAPI?.downloadUpdate();
    } catch (error) {
      console.error('Failed to download update:', error);
      setIsDownloading(false);
    }
  };

  const handleInstallUpdate = async () => {
    try {
      await window.electronAPI?.installUpdate();
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Manual check for updates button */}
      <Button
        variant="outlined"
        startIcon={<Update />}
        onClick={handleCheckForUpdates}
        sx={{ mb: 2 }}
      >
        Check for Updates
      </Button>

      {/* Update download progress */}
      {isDownloading && updateProgress && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert severity="info" icon={<Download />}>
            <Typography variant="body2">
              Downloading update... {updateProgress.percent}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={updateProgress.percent} 
              sx={{ mt: 1, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatBytes(updateProgress.transferred)} / {formatBytes(updateProgress.total)}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Update completion notification */}
      {updateProgress?.percent === 100 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            action={
              <Button color="inherit" size="small" onClick={handleInstallUpdate}>
                Install & Restart
              </Button>
            }
          >
            <Typography variant="body2">
              Update downloaded successfully! Click to install and restart the application.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Current version info */}
      {updateInfo && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Current version: {updateInfo.version}
        </Typography>
      )}
    </>
  );
};

export default UpdateNotification;
