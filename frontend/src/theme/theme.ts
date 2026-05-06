import { createTheme } from '@mui/material/styles';

// Pledgy brand: orange-pink #FF916A, mid pink #F05A78, purple #9D5FE6
const brand = {
  orange: '#FF916A',
  pink: '#F05A78',
  purple: '#9D5FE6',
  gradient: 'linear-gradient(135deg, #FF916A 0%, #F05A78 50%, #9D5FE6 100%)',
  gradientRgb: '240, 90, 120', // for rgba(brand, alpha)
} as const;

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brand.pink,
      light: brand.orange,
      dark: brand.purple,
    },
    secondary: {
      main: '#A0AEC0',
      light: '#CBD5E1',
      dark: '#718096',
    },
    background: {
      default: '#0f0d14',
      paper: '#1a1625',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
    },
    success: {
      main: '#48BB78',
      light: '#68D391',
      dark: '#38A169',
    },
    info: {
      main: brand.pink,
    },
    warning: {
      main: '#ED8936',
    },
    error: {
      main: '#E53E3E',
      light: '#FC8181',
      dark: '#C53030',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.6rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.6rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.4rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.2rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1625',
          border: `1px solid rgba(${brand.gradientRgb}, 0.15)`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.25s ease',
          '&:hover': {
            borderColor: `rgba(${brand.gradientRgb}, 0.35)`,
            boxShadow: `0 8px 32px rgba(${brand.gradientRgb}, 0.08)`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        contained: {
          background: brand.gradient,
          color: '#FFFFFF',
          boxShadow: `0 4px 14px rgba(${brand.gradientRgb}, 0.35)`,
          '&:hover': {
            filter: 'brightness(1.08)',
            boxShadow: `0 6px 20px rgba(${brand.gradientRgb}, 0.45)`,
          },
        },
        outlined: {
          border: `1px solid rgba(${brand.gradientRgb}, 0.4)`,
          color: brand.pink,
          backgroundColor: 'transparent',
          '&:hover': {
            borderColor: brand.pink,
            backgroundColor: `rgba(${brand.gradientRgb}, 0.08)`,
          },
        },
        text: {
          color: brand.pink,
          '&:hover': {
            backgroundColor: `rgba(${brand.gradientRgb}, 0.08)`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          fontWeight: 500,
        },
        outlined: {
          borderColor: `rgba(${brand.gradientRgb}, 0.4)`,
          color: brand.pink,
          '&:hover': {
            borderColor: brand.pink,
            backgroundColor: `rgba(${brand.gradientRgb}, 0.08)`,
          },
        },
      },
    },
  },
});
