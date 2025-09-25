// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const baseColor = '#f4f0e7'; // shared color

const theme = createTheme({
  palette: {
    primary: {
      main: '#8B6C5C',     // earthy brown
      light: '#A48776',
      dark: '#5C4033',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4A373',     // soft golden tan
      light: '#E6BE9A',
      dark: '#A67852',
      contrastText: '#ffffff',
    },
    background: {
      default: baseColor,   // parchment background
      paper: '#ffffff',
    },
    success: {
      main: '#6C9A8B',      // muted sage green
      light: '#9FC7B6',
      dark: '#4F7263',
    },
    warning: {
      main: '#E0A458',      // warm amber
      light: '#F3C585',
      dark: '#B87634',
    },
    error: {
      main: '#D9534F',      // soft red
      light: '#E57373',
      dark: '#B52B27',
    },
    info: {
      main: '#6A8CAF',      // dusty blue
      light: '#90B1D1',
      dark: '#466585',
    },
    text: {
      primary: '#2F2F2F',   // dark gray-black for contrast
      secondary: '#5C5C5C', // softer gray
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      color: '#2F2F2F',
      '@media (max-width:600px)': { fontSize: '2rem' },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#2F2F2F',
      '@media (max-width:600px)': { fontSize: '2rem' },
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
      color: '#2F2F2F',
      '@media (max-width:600px)': { fontSize: '1.5rem' },
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: '#2F2F2F',
      '@media (max-width:600px)': { fontSize: '1.25rem' },
    },
    h5: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h6: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          backgroundColor: baseColor,
        },
        '*': { boxSizing: 'border-box' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 108, 92, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 20px rgba(139, 108, 92, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': { borderColor: '#8B6C5C' },
            '&.Mui-focused fieldset': { borderColor: '#8B6C5C' },
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: '#8B6C5C',
            color: '#fff',
            '&:hover': { backgroundColor: '#5C4033' },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: baseColor,
          color: '#2F2F2F',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

export default theme;
