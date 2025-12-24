import { Theme } from './types';

/**
 * Tema claro por defecto
 */
export const lightTheme: Theme = {
  isDark: false,
  colors: {
    surface: {
      primary: '#FCFCFC',
      secondary: '#ffffff',
    },
    content: {
      primary: '#101828',
      secondary: '#667085',
      tertiary: '#98A2B3',
      onPrimary: '#FFFFFF',
    },
    action: {
      primary: '#007AFF',
      pressed: '#0056B3',
      disabled: '#D0D5DD',
    },
    status: {
      error: '#D92D20',
      success: '#27AE60',
      warning: '#E37E07',
      info: '#1570EF',
    },
    structure: {
      divider: '#EBEBEB',
      border: '#D0D5DD',
    },
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    touchTarget: 48,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 30,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 18,
    full: 9999,
  },
  shadows: {
    none: {},
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

/**
 * Tema oscuro por defecto
 */
export const darkTheme: Theme = {
  ...lightTheme,
  isDark: true,
  colors: {
    ...lightTheme.colors,
    surface: {
      primary: '#0C0C0C',
      secondary: '#1A1A1A',
    },
    content: {
      primary: '#F9FAFB',
      secondary: '#98A2B3',
      tertiary: '#475467',
      onPrimary: '#FFFFFF',
    },
    action: {
      primary: '#3395FF',
      pressed: '#66AFFF',
      disabled: '#344054',
    },
    status: {
      error: '#F04438',
      success: '#6CE9A6',
      warning: '#FEC84B',
      info: '#53B1FD',
    },
    structure: {
      divider: '#333333',
      border: '#475467',
    },
  },
};
