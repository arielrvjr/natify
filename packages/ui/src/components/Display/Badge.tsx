import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ColorPalette, useTheme } from '../../theme';
import { Text } from '../Text';

export interface BadgeProps {
  children?: React.ReactNode;
  count?: number;
  maxCount?: number;
  variant?: Exclude<keyof ColorPalette, 'background' | 'surface' | 'overlay'>;
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
  variant = 'textPrimary',
  dot = false,
  style,
}) => {
  const { theme } = useTheme();

  const displayCount = count && count > maxCount ? `${maxCount}+` : (count?.toString() ?? '');

  if (dot) {
    return <View style={[styles.dot, { backgroundColor: theme.colors[variant] }, style]} />;
  }

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
          backgroundColor: theme.colors[variant],
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.borderRadius.lg,
        },
        style,
      ]}
    >
      <Text color="textPrimary" variant="caption">
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
          {badge || <Badge count={count} dot={dot} variant={variant} />}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    minHeight: 16,
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
