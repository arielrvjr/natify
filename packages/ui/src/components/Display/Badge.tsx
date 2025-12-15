import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';

export interface BadgeProps {
  children?: React.ReactNode;
  count?: number;
  maxCount?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: ViewStyle;
}

/**
 * Componente de badge/etiqueta
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  count,
  maxCount = 99,
  variant = 'primary',
  size = 'md',
  dot = false,
  style,
}) => {
  const { theme } = useTheme();

  const variantColors = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
  };

  const sizes = {
    sm: { minWidth: 16, height: 16, fontSize: 10, padding: 2 },
    md: { minWidth: 20, height: 20, fontSize: 12, padding: 4 },
  };

  const sizeStyle = sizes[size];
  const displayCount = count && count > maxCount ? `${maxCount}+` : (count?.toString() ?? '');

  if (dot) {
    return <View style={[styles.dot, { backgroundColor: variantColors[variant] }, style]} />;
  }

  // Siempre envolver el contenido en Text para cumplir con React Native
  // Convertir children a string si es necesario
  const content = children
    ? typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : String(children)
    : displayCount;

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: sizeStyle.minWidth,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.padding,
          backgroundColor: variantColors[variant],
          borderRadius: sizeStyle.height / 2,
        },
        style,
      ]}
    >
      <Text color={theme.colors.white} weight="bold" variant="caption">
        {content}
      </Text>
    </View>
  );
};

/**
 * Wrapper para poner badge en un componente
 */
export interface BadgeWrapperProps {
  children: React.ReactNode;
  badge?: React.ReactNode;
  count?: number;
  dot?: boolean;
  variant?: BadgeProps['variant'];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offset?: { x?: number; y?: number };
}

export const BadgeWrapper: React.FC<BadgeWrapperProps> = ({
  children,
  badge,
  count,
  dot,
  variant = 'error',
  position = 'top-right',
  offset = {},
}) => {
  const positionStyles: ViewStyle = {
    position: 'absolute',
    ...(position.includes('top') ? { top: offset.y ?? -4 } : { bottom: offset.y ?? -4 }),
    ...(position.includes('right') ? { right: offset.x ?? -4 } : { left: offset.x ?? -4 }),
  };

  const showBadge = badge || count !== undefined || dot;

  return (
    <View style={styles.wrapper}>
      {children}
      {showBadge && (
        <View style={positionStyles}>
          {badge || <Badge count={count} dot={dot} variant={variant} size="sm" />}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  wrapper: {
    position: 'relative',
  },
});
