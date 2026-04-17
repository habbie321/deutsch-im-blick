import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#18181b'
    },
    secondary: {
      main: '#52525b'
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    },
    text: {
      primary: '#18181b',
      secondary: '#71717a'
    },
    divider: '#e4e4e7'
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: "'Inter', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 650 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fafafa'
        }
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e7eb'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 2px rgba(24, 24, 27, 0.05)'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
        disableTouchRipple: true
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600
        }
      }
    },
    MuiCardActionArea: {
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 500
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14
        }
      }
    }
  }
});

export default theme;
