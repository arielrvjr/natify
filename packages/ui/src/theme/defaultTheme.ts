import { Theme } from './types';

/**
 * Tema claro por defecto
 */
export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#007AFF',
    primaryLight: '#5AC8FA',
    primaryDark: '#0051A8',
    secondary: '#5856D6',
    secondaryLight: '#7A79E0',
    secondaryDark: '#3634A3',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    border: '#E5E7EB',
    divider: '#E5E7EB',
    placeholder: '#9CA3AF',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
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
    primary: '#0A84FF',
    primaryLight: '#64D2FF',
    primaryDark: '#0051A8',
    secondary: '#5E5CE6',
    secondaryLight: '#BF5AF2',
    secondaryDark: '#3634A3',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#64D2FF',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textDisabled: '#636366',
    border: '#38383A',
    divider: '#38383A',
    placeholder: '#636366',
  },
};
