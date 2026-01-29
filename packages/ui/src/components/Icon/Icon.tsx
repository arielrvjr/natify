import React from 'react';
import { ColorPalette, useTheme } from '../../theme';
import { icons } from 'lucide-react-native';

export type IconName = keyof typeof icons;

export interface IconProps {
  /**
   * Nombre del icono de Lucide
   */
  name: IconName;

  /**
   * Tamaño del icono (en pixels)
   * @default 24
   */
  size?: number;

  /**
   * Color del icono
   * - 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info'
   * - O un color hexadecimal personalizado
   * @default 'primary'
   */
  color?:
    | Exclude<keyof ColorPalette, 'background' | 'surface' | 'overlay' | 'surfaceDisabled'>
    | string;
}

/**
 * Componente Icon usando Lucide React Native
 *
 * @example
 * ```tsx
 * <Icon name="Settings" size={24} color="primary" />
 * <Icon name="Heart" size={20} color="error" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'primary' }) => {
  const { theme } = useTheme();

  // Resolver el color (hooks deben ir antes de early returns)
  const iconColor = React.useMemo(() => {
    if (typeof color === 'string' && color.startsWith('#')) {
      return color; // Color hexadecimal personalizado
    }

    switch (color) {
      case 'textPrimary':
        return theme.colors.textPrimary;
      case 'textSecondary':
        return theme.colors.textSecondary;
      case 'textDisabled':
        return theme.colors.textDisabled;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.textPrimary;
    }
  }, [color, theme]);

  // Obtener el componente del icono desde Lucide
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(
      `[Icon] Icon "${name}" not found in Lucide. Available icons: ${Object.keys(icons)
        .slice(0, 10)
        .join(', ')}...`,
    );
    return null;
  }

  // Renderizar el componente de Lucide directamente
  return <LucideIcon size={size} color={iconColor} strokeWidth={2} />;
};
