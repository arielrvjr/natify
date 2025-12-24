import React from 'react';
import { useTheme } from '../../theme';
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
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info' | string;
}

/**
 * Componente Icon usando Lucide React Native
 *
 * @example
 * ```tsx
 * <Icon name="Settings" size={24} color="primary" />
 * <Icon name="Heart" size={20} color="error" />
 * <Icon name="ArrowLeft" size={16} color="#FF0000" />
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
      case 'primary':
        return theme.colors.content.primary;
      case 'secondary':
        return theme.colors.content.secondary;
      case 'tertiary':
        return theme.colors.content.tertiary;
      case 'error':
        return theme.colors.status.error;
      case 'success':
        return theme.colors.status.success;
      case 'warning':
        return theme.colors.status.warning;
      case 'info':
        return theme.colors.status.info;
      default:
        return theme.colors.content.primary;
    }
  }, [color, theme]);

  // Obtener el componente del icono desde Lucide
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(
      `[Icon] Icon "${name}" not found in Lucide. Available icons: ${Object.keys(icons).slice(0, 10).join(', ')}...`,
    );
    return null;
  }

  // Renderizar el componente de Lucide directamente
  return <LucideIcon size={size} color={iconColor} strokeWidth={2} />;
};
