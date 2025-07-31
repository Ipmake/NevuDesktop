import { createTheme } from '@mui/material/styles';

// Modern Nevu theme with deep blue-black background and Inter Variable font
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Indigo
      dark: '#4F46E5',
      light: '#818CF8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F43F5E', // Rose
      dark: '#E11D48',
      light: '#FB7185',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#000000', // Deep blue-black
      paper: '#121927',
    },
    surface: {
      main: '#1F2937',
      light: '#374151',
      dark: '#111827',
    },
    text: {
      primary: '#F4F8FF',
      secondary: '#CBD5E1',
      disabled: '#6B7280',
    },
    divider: '#374151',
    error: {
      main: '#EF4444',
      dark: '#DC2626',
      light: '#F87171',
    },
    warning: {
      main: '#F59E0B',
      dark: '#D97706',
      light: '#FBBF24',
    },
    success: {
      main: '#10B981',
      dark: '#059669',
      light: '#34D399',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
  },
  typography: {
    fontFamily: '"Inter Variable", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 7,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderBottom: '1px solid #374151',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          padding: '10px 20px',
          fontWeight: 500,
          fontFamily: '"Inter Variable", sans-serif',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(99, 102, 241, 0.2)',
          },
        },
        contained: {
          backgroundColor: '#6366F1',
          '&:hover': {
            backgroundColor: '#4F46E5',
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          height: '100vh',
          zIndex: 200,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#121927',
          border: '1px solid #374151',
          borderRadius: 7,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#121927',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1F2937',
            borderRadius: 7,
            '& fieldset': {
              borderColor: '#374151',
            },
            '&:hover fieldset': {
              borderColor: '#6366F1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366F1',
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#6366F1',
            '& + .MuiSwitch-track': {
              backgroundColor: '#6366F1',
              opacity: 0.5,
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          marginBottom: 4,
          '&:hover': {
            backgroundColor: '#1F2937',
          },
        },
      },
    },
  },
});

// Extend the theme to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
      light: string;
      dark: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      main?: string;
      light?: string;
      dark?: string;
    };
  }
}
