import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

/**
 * Componente de checkbox
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  error,
  size = 'md',
  style,
}) => {
  const { theme } = useTheme();

  const sizes = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  const boxSize = sizes[size];

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => !disabled && onChange(!checked)}
        activeOpacity={0.7}
        disabled={disabled}
        style={styles.container}
      >
        <View
          style={[
            styles.box,
            {
              width: boxSize,
              height: boxSize,
              borderRadius: theme.borderRadius.sm,
              borderColor: error
                ? theme.colors.error
                : checked
                  ? theme.colors.textPrimary
                  : theme.colors.textDisabled,
              backgroundColor: checked ? theme.colors.accent : 'transparent',
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {checked && (
            <Text color="textPrimary" style={{ fontSize: boxSize * 0.6, lineHeight: boxSize }}>
              ✓
            </Text>
          )}
        </View>

        {label && (
          <Text color={disabled ? 'textDisabled' : 'textPrimary'} style={styles.label}>
            {label}
          </Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginLeft: 10,
  },
  error: {
    marginTop: 4,
  },
});
