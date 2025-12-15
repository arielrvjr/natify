/**
 * Paleta de colores del tema
 */
export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  divider: string;
  placeholder: string;
  white: string;
  black: string;
  transparent: string;
}

/**
 * Espaciado del tema
 */
export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

/**
 * Tipografía del tema
 */
export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * Border radius del tema
 */
export interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

/**
 * Sombras del tema
 */
export interface Shadows {
  none: object;
  sm: object;
  md: object;
  lg: object;
}

/**
 * Tema completo
 */
export interface Theme {
  colors: ColorPalette;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  shadows: Shadows;
  isDark: boolean;
}
