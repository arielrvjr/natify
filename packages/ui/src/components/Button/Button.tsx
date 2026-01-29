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

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
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
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const isDisabled = disabled || loading;

    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.surfaceDisabled : theme.colors.surface,
          },
          text: {
            color: isDisabled ? theme.colors.textDisabled : theme.colors.textPrimary,
          },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: {
            color: isDisabled ? theme.colors.textDisabled : theme.colors.textPrimary,
          },
        };
      default: //primary
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.disabled : theme.colors.accent,
          },
          text: {
            color: isDisabled ? theme.colors.textDisabled : theme.colors.textPrimary,
          },
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
        { borderRadius: theme.borderRadius.lg, height: theme.spacing.touchTarget },
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
            style={[
              theme.typography.caption,
              variantStyles.text,
              leftIcon ? { marginLeft: theme.spacing.xs } : undefined,
              rightIcon ? { marginRight: theme.spacing.xs } : undefined,
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
