/**
 * Paleta de colores del tema
 */
export interface ColorPalette {
  background: string;
  surface: string;
  surfaceDisabled: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
  disabled: string;
}

/**
 * Espaciado del tema
 */
export interface Spacing {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  touchTarget: number;
}

export interface TypographyStyle {
  fontSize: number;
  fontWeight: '400' | '600' | '700';
  lineHeight: number;
  letterSpacing?: number;
}
/**
 * Tipografía del tema
 */
export interface Typography {
  display: TypographyStyle;
  heading: TypographyStyle;
  body: TypographyStyle;
  caption: TypographyStyle;
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
 * Tema completo
 */
export interface Theme {
  colors: ColorPalette;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  isDark: boolean;
}
