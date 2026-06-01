import { createTheme } from '@mui/material/styles';

const palette = {
  primary: '#4F5DFF',
  primaryLight: '#7C8CFF',
  mint: '#56D4B4',
  mintLight: '#A8F0D8',
  text: '#2B2D42',
  textMuted: '#7A7F9A',
  border: '#E8EBF3',
  background: '#F7F8FC',
  surface: '#FFFFFF',
};

export const getAppTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: palette.primary,
        light: palette.primaryLight,
        dark: '#3A4ADB',
        contrastText: '#ffffff',
      },
      secondary: {
        main: palette.mint,
        light: palette.mintLight,
        dark: '#3BB896',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#1a1b2e' : palette.background,
        paper: mode === 'dark' ? '#242542' : palette.surface,
      },
      text: {
        primary: mode === 'dark' ? '#e8e9f0' : palette.text,
        secondary: mode === 'dark' ? '#9a9bb5' : palette.textMuted,
      },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : palette.border,
      action: {
        hover: mode === 'dark' ? 'rgba(79, 93, 255, 0.08)' : 'rgba(79, 93, 255, 0.04)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: palette.text,
      },
      h2: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: palette.text,
      },
      h3: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        fontWeight: 600,
        color: palette.text,
      },
      h4: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        fontWeight: 600,
        color: palette.text,
      },
      h5: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        fontWeight: 600,
        color: palette.text,
      },
      h6: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        fontWeight: 500,
        color: palette.text,
      },
      subtitle1: {
        fontWeight: 500,
      },
      body1: {
        fontSize: '0.925rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontFamily: '"Outfit", sans-serif',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: mode === 'dark'
              ? '0 2px 12px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : palette.border}`,
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: `0 4px 14px rgba(79, 93, 255, 0.25)`,
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${palette.primary} 0%, #3A4ADB 100%)`,
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${palette.mint} 0%, #3BB896 100%)`,
          },
          outlinedPrimary: {
            borderColor: palette.primary,
            color: palette.primary,
            '&:hover': {
              borderColor: '#3A4ADB',
              backgroundColor: 'rgba(79, 93, 255, 0.04)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'dark' ? '#1e1f36' : '#F7F8FC',
            color: mode === 'dark' ? '#9a9bb5' : palette.textMuted,
            borderBottom: `1px solid ${palette.border}`,
            fontSize: '0.8rem',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          },
          root: {
            borderBottom: `1px solid ${palette.border}`,
            color: mode === 'dark' ? '#e8e9f0' : palette.text,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.primary,
            },
          },
          notchedOutline: {
            borderColor: palette.border,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? '#242542' : palette.surface,
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : palette.border}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: 'rgba(79, 93, 255, 0.1)',
            color: palette.primary,
            fontWeight: 600,
          },
          colorSecondary: {
            backgroundColor: 'rgba(86, 212, 180, 0.1)',
            color: palette.mint,
            fontWeight: 600,
          },
          colorSuccess: {
            backgroundColor: 'rgba(86, 212, 180, 0.1)',
            color: '#22C55E',
            fontWeight: 600,
          },
          colorError: {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            fontWeight: 600,
          },
          colorWarning: {
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: '#F59E0B',
            fontWeight: 600,
          },
          colorInfo: {
            backgroundColor: 'rgba(79, 93, 255, 0.1)',
            color: palette.primary,
            fontWeight: 600,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};
