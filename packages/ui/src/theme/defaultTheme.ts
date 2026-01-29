import { Theme } from './types';

/**
 * Tema claro por defecto
 */
export const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceDisabled: '#E9ECEF',
    textPrimary: '#121417',
    textSecondary: '#636E72',
    textDisabled: '#A0A5A9',
    accent: '#0984E3',
    error: '#D63031',
    success: '#00B894',
    warning: '#F1C40F',
    info: '#0984E3',
    overlay: '#000000',
    disabled: '#0000000C',
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
    display: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    heading: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
  borderRadius: {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 99999,
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
    background: '#121417',
    surface: '#1B1E22',
    surfaceDisabled: '#16191C',
    textPrimary: '#FFFFFF',
    textSecondary: '#70757A',
    textDisabled: '#454B50',
    accent: '#2C9160',
    error: '#E91E63',
    success: '#4AF2A1',
    warning: '#FFD600',
    info: '#2196F3',
    overlay: '#FFFFFF',
    disabled: '#FFFFFF0D',
  },
};
