/**
 * Globalna MUI tema za aplikacijo Stanovanja Stroški.
 *
 * Barve temeljijo na modernem SaaS dashboard pristopu:
 *   - Primarna (emerald / teal): za gumbe, poudarke, aktivna stanja
 *   - Ozadje: svetlo (#f1f5f9)
 *   - Stranski meni: svetel (#ffffff)
 *   - Kartice: bele z subtilnimi sencami
 *
 * Robovi zaobljeni minimalno (4–6 px) za profesionalen videz.
 * Chippi / značke: borderRadius 4 px – NE pilula oblika.
 */
import { createTheme } from '@mui/material/styles';

// ---------- Osnovna paleta – Emerald / Teal ----------
const EMERALD_600 = '#059669';
const EMERALD_700 = '#047857';
const EMERALD_50  = '#ecfdf5';
const TEAL_600    = '#0d9488';

const NAVY_900 = '#0f172a';
const NAVY_800 = '#1e293b';
const NAVY_700 = '#334155';
const NAVY_500 = '#64748b';
const NAVY_300 = '#cbd5e1';
const NAVY_100 = '#f1f5f9';

const tema = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: EMERALD_600,
      dark: EMERALD_700,
      light: '#34d399',
      contrastText: '#ffffff',
    },
    secondary: {
      main: NAVY_800,
      contrastText: '#ffffff',
    },
    background: {
      default: NAVY_100,
      paper: '#ffffff',
    },
    text: {
      primary: NAVY_900,
      secondary: NAVY_500,
    },
    divider: 'rgba(15, 23, 42, 0.09)',
    success: {
      main: '#22c55e',
      light: '#dcfce7',
      dark: '#15803d',
      contrastText: '#14532d',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#92400e',
      contrastText: '#78350f',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
      contrastText: '#7f1d1d',
    },
    info: {
      main: '#3b82f6',
      light: '#dbeafe',
      contrastText: '#1e3a8a',
    },
  },

  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
  },

  shape: {
    // Osnovna zaobljenost – kartice, polja …
    borderRadius: 8,
  },

  shadows: [
    'none',
    '0 1px 2px rgba(15,23,42,0.07)',
    '0 2px 6px rgba(15,23,42,0.08)',
    '0 4px 12px rgba(15,23,42,0.10)',
    '0 6px 18px rgba(15,23,42,0.10)',
    '0 8px 24px rgba(15,23,42,0.12)',
    '0 12px 32px rgba(15,23,42,0.12)',
    '0 16px 40px rgba(15,23,42,0.14)',
    '0 20px 48px rgba(15,23,42,0.14)',
    '0 24px 56px rgba(15,23,42,0.15)',
    '0 28px 64px rgba(15,23,42,0.15)',
    '0 32px 72px rgba(15,23,42,0.16)',
    '0 36px 80px rgba(15,23,42,0.16)',
    '0 40px 88px rgba(15,23,42,0.17)',
    '0 44px 96px rgba(15,23,42,0.17)',
    '0 48px 104px rgba(15,23,42,0.18)',
    '0 52px 112px rgba(15,23,42,0.18)',
    '0 56px 120px rgba(15,23,42,0.19)',
    '0 60px 128px rgba(15,23,42,0.19)',
    '0 64px 136px rgba(15,23,42,0.20)',
    '0 68px 144px rgba(15,23,42,0.20)',
    '0 72px 152px rgba(15,23,42,0.21)',
    '0 76px 160px rgba(15,23,42,0.21)',
    '0 80px 168px rgba(15,23,42,0.22)',
    '0 84px 176px rgba(15,23,42,0.22)',
  ],

  components: {
    // ---------- MuiCssBaseline ----------
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: NAVY_100,
          scrollbarWidth: 'thin',
        },
      },
    },

    // ---------- Card ----------
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid rgba(15,23,42,0.09)`,
          boxShadow: '0 1px 3px rgba(15,23,42,0.07)',
          borderRadius: 10,
        },
      },
    },

    // ---------- Paper ----------
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    // ---------- Button ----------
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '7px 16px',
          fontSize: '0.8125rem',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${EMERALD_600} 0%, ${TEAL_600} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${EMERALD_700} 0%, ${EMERALD_600} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${NAVY_800} 0%, ${NAVY_900} 100%)`,
          '&:hover': {
            background: NAVY_900,
          },
        },
        outlinedPrimary: {
          borderColor: EMERALD_600,
          color: EMERALD_600,
          '&:hover': {
            background: EMERALD_50,
          },
        },
        sizeSmall: {
          padding: '5px 12px',
          fontSize: '0.75rem',
        },
      },
    },

    // ---------- Chip – BEZ pill oblike (borderRadius: 4) ----------
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.01em',
          height: 22,
        },
        colorSuccess: {
          backgroundColor: '#dcfce7',
          color: '#15803d',
          border: '1px solid #bbf7d0',
        },
        colorWarning: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fde68a',
        },
        colorError: {
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
        },
        colorInfo: {
          backgroundColor: '#dbeafe',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
        },
        colorPrimary: {
          backgroundColor: EMERALD_50,
          color: EMERALD_700,
          border: `1px solid #a7f3d0`,
        },
        outlinedSuccess: {
          backgroundColor: '#f0fdf4',
          color: '#15803d',
        },
        outlinedWarning: {
          backgroundColor: '#fffbeb',
          color: '#92400e',
        },
        outlinedInfo: {
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
        },
        outlinedPrimary: {
          backgroundColor: EMERALD_50,
          color: EMERALD_700,
        },
      },
    },

    // ---------- TextField ----------
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: NAVY_700,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: EMERALD_600,
          },
        },
      },
    },

    // ---------- DataGrid ----------
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid rgba(15,23,42,0.09)`,
          borderRadius: 8,
          fontSize: '0.8rem',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid rgba(15,23,42,0.10)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: NAVY_500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: '#f8fafc',
            },
            '&.Mui-selected': {
              backgroundColor: EMERALD_50,
              '&:hover': { backgroundColor: EMERALD_50 },
            },
          },
          '& .MuiDataGrid-cell': {
            borderColor: 'rgba(15,23,42,0.06)',
            '&:focus, &:focus-within': {
              outline: `2px solid ${EMERALD_600}`,
              outlineOffset: -2,
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(15,23,42,0.09)',
            backgroundColor: '#f8fafc',
          },
        },
      },
    },

    // ---------- Tab ----------
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          minWidth: 0,
          padding: '10px 16px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2,
          borderRadius: 2,
        },
      },
    },

    // ---------- Dialog ----------
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 24px 64px rgba(15,23,42,0.20)',
        },
      },
    },

    // ---------- Alert ----------
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.8125rem',
        },
      },
    },

    // ---------- Switch ----------
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 40,
          height: 24,
          padding: 0,
        },
        switchBase: {
          padding: 3,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: EMERALD_600,
              opacity: 1,
            },
          },
        },
        thumb: { width: 18, height: 18 },
        track: {
          borderRadius: 12,
          backgroundColor: NAVY_300,
          opacity: 1,
        },
      },
    },

    // ---------- Tooltip ----------
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
          fontSize: '0.75rem',
          backgroundColor: NAVY_900,
        },
      },
    },
  },
});

export default tema;
