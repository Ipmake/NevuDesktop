import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  Computer,
  Search,
  PlayArrow,
} from '@mui/icons-material';
import { ServerInfo } from '../types';
import logoBigImg from '../logoBig.png';

interface SetupProps {
  discoveredServers: ServerInfo[];
  onServerSelect: (url: string) => void;
}

const Setup: React.FC<SetupProps> = ({ discoveredServers, onServerSelect }) => {
  // Remove manual refresh functionality - discovery is now always automatic
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        background: 'linear-gradient(135deg, #000000 0%, #030507ff 100%)',
        minHeight: '100%',
      }}
    >
      <Box
        sx={{
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
                    <img
            src={logoBigImg}
            alt="Nevu"
            style={{
              height: 60,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Welcome to Nevu Desktop
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            Connect to your Nevu server to get started. We're automatically listening for servers on your network.
          </Typography>
        </Box>

        {/* Server Discovery Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search sx={{ color: 'primary.main' }} />
                <Typography variant="h6">
                  Discovered Servers (Auto Discovery)
                </Typography>
              </Box>
            </Box>

            {discoveredServers.length > 0 ? (
              <List sx={{ p: 0 }}>
                {discoveredServers.map((server, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => onServerSelect(server.url)}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(99, 102, 241, 0.05)',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Computer sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {server.name}
                            </Typography>
                            <Chip 
                              label={server.version} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {server.url}
                            </Typography>
                            {server.plexServer !== 'Unknown' && (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Plex Server: {server.plexServer}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <PlayArrow sx={{ color: 'primary.main', ml: 1 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  No Nevu servers found on your network.
                </Typography>
                <Alert severity="info" sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Make sure your Nevu server is running and connected to the same network.
                  </Typography>
                  <Typography variant="body2">
                    You can also manually configure the server URL in Settings.
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Need help? Make sure your Nevu server is running and discoverable on your local network.
          You can also manually configure the connection in the settings menu.
        </Typography>
      </Box>
    </Box>
  );
};

export default Setup;
