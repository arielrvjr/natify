import React, { useState, forwardRef } from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: object;
  inputStyle?: object;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Componente de input con soporte de tema
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      disabled = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const getBorderColor = () => {
      if (error) return theme.colors.error;
      if (isFocused) return theme.colors.primary;
      return theme.colors.border;
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text variant="label" weight="medium" style={styles.label}>
              {label}
              {required && <Text color={theme.colors.error}> *</Text>}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              backgroundColor: disabled ? theme.colors.border : theme.colors.surface,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.md,
              },
              leftIcon ? { paddingLeft: 0 } : undefined,
              rightIcon ? { paddingRight: 0 } : undefined,
              inputStyle,
            ]}
            placeholderTextColor={theme.colors.placeholder}
            editable={!disabled}
            onFocus={e => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>

        {(error || hint) && (
          <Text
            variant="caption"
            color={error ? theme.colors.error : theme.colors.textSecondary}
            style={styles.helperText}
          >
            {error || hint}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  helperText: {
    marginTop: 4,
  },
});
