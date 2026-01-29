import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Componente de tarjeta con soporte de tema
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'filled',
  padding = 'md',
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  const paddingValues = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.textDisabled,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surface,
        };
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: theme.borderRadius.lg,
    padding: paddingValues[padding],
    ...getVariantStyles(),
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
