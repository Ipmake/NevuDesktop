import React from "react";
import { Box, Typography, IconButton, AppBar, Toolbar } from "@mui/material";
import {
  Settings as SettingsIcon,
  Minimize,
  CropSquare,
  Close,
} from "@mui/icons-material";
import iconImg from "../icon.png";

interface TitleBarProps {
  onSettingsClick: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ onSettingsClick }) => {
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI.toggleMaximize();
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "background.default",
        borderBottom: "0px solid",
        borderBottomColor: "divider",
        WebkitAppRegion: "drag",
        userSelect: "none",
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 40,
          height: 40,
          pl: "12px",
          pr: "0px",
          px: "0px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",

          // media query min width 600px
          "@media (min-width: 600px)": {
            px: "12px",
            pr: "0px",
            pl: "12px",
          },
        }}
      >
        {/* Left side - App title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src={iconImg}
            alt="Nevu"
            style={{
              width: 18,
              height: 18,
              objectFit: "contain",
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              color: "text.primary",
            }}
          >
            Nevu Desktop
          </Typography>
        </Box>

        {/* Right side - Window controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            WebkitAppRegion: "no-drag",
          }}
        >
          <IconButton
            size="small"
            onClick={onSettingsClick}
            sx={{
              color: "text.secondary",
              width: 32,
              height: 32,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "surface.main",
                color: "text.primary",
              },
            }}
          >
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleMinimize}
            sx={{
              color: "text.secondary",
              width: 32,
              height: 32,
              borderRadius: 1,
              ml: 0.5,
              "&:hover": {
                backgroundColor: "surface.main",
                color: "text.primary",
              },
            }}
          >
            <Minimize sx={{ fontSize: 16 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleMaximize}
            sx={{
              color: "text.secondary",
              width: 32,
              height: 32,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "surface.main",
                color: "text.primary",
              },
            }}
          >
            <CropSquare sx={{ fontSize: 14 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: "text.secondary",
              width: 32,
              height: 32,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
              },
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TitleBar;
