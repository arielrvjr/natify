import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Componente de botón con variantes y soporte de tema
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 20 },
    lg: { paddingVertical: 16, paddingHorizontal: 24 },
  };

  const textSizes = {
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.md,
    lg: theme.typography.fontSize.lg,
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const isDisabled = disabled || loading;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.textDisabled : theme.colors.primary,
          },
          text: { color: theme.colors.white },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.textDisabled : theme.colors.secondary,
          },
          text: { color: theme.colors.white },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? theme.colors.textDisabled : theme.colors.primary,
          },
          text: { color: isDisabled ? theme.colors.textDisabled : theme.colors.primary },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: isDisabled ? theme.colors.textDisabled : theme.colors.primary },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.textDisabled : theme.colors.error,
          },
          text: { color: theme.colors.white },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        sizeStyles[size],
        { borderRadius: theme.borderRadius.md },
        variantStyles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text.color} />
      ) : (
        <>
          {leftIcon}
          <Text
            weight="medium"
            style={[
              { fontSize: textSizes[size] },
              variantStyles.text,
              leftIcon ? { marginLeft: 8 } : undefined,
              rightIcon ? { marginRight: 8 } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
