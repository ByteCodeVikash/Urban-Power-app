import { createTheme } from '@mui/material/styles';

// Colors based on brand specifications
// Yellow: #FAD02C (Primary), Dark Gray: #212529 (Secondary), White: #FFFFFF (Background)
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FAD02C',
      light: '#FFE066',
      dark: '#C29D0A',
      contrastText: '#212529', // Dark text on yellow for legibility
    },
    secondary: {
      main: '#212529',
      light: '#495057',
      dark: '#121416',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F7FAFC', // Sleek light gray for page backgrounds
      paper: '#FFFFFF',   // White for cards and modals
    },
    text: {
      primary: '#1A202C',
      secondary: '#718096',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
    },
    button: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
      textTransform: 'none', // Prevent all-caps for a cleaner, modern look
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          },
          ...(ownerState?.variant === 'contained' && ownerState?.color === 'primary' && {
            backgroundColor: '#FAD02C',
            color: '#1A202C',
            '&:hover': {
              backgroundColor: '#E5BD1B',
            },
          }),
          ...(ownerState?.variant === 'contained' && ownerState?.color === 'secondary' && {
            backgroundColor: '#212529',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#121416',
            },
          }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A202C',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#F7FAFC',
          color: '#4A5568',
        },
      },
    },
  },
});
