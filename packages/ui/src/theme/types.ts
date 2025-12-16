/**
 * Paleta de colores del tema
 */
export interface ColorPalette {
  surface: {
    primary: string; // Fondo base (ej. #FFFFFF en Light, #0C0C0C en Dark)
    secondary: string; // Superficie de elementos elevados (ej. Cards, Inputs)
  };
  content: {
    primary: string; // Texto principal (Títulos, Body). Alto contraste.
    secondary: string; // Texto de apoyo (Captions, Subtextos). Contraste medio.
    tertiary: string; // Texto/Iconos deshabilitados o Placeholders. Bajo contraste.
    onPrimary: string; // Texto que va sobre action.primary (Botones).
  };
  action: {
    primary: string; // Color principal de la marca para interacciones.
    pressed: string; // Color que aparece al tocar (Feedback táctil).
    disabled: string; // Color de fondo para elementos de acción inactivos.
  };
  status: {
    error: string; // Comunicación de fallos y validación.
    success: string; // Confirmaciones y acciones completadas.
    warning: string; // Alertas, precauciones.
    info: string; // Notificaciones neutrales o informativas.
  };
  structure: {
    divider: string; // Líneas divisorias sutiles en listas.
    border: string; // Borde de inputs en estado Default.
  };
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
  title: TypographyStyle;
  subtitle: TypographyStyle;
  body: TypographyStyle;
  caption: TypographyStyle;
  label: TypographyStyle;
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
