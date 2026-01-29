import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';

export interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T = string> {
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  error?: string;
  horizontal?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Componente de grupo de radio buttons
 */
export function RadioGroup<T = string>({
  options,
  value,
  onChange,
  label,
  error,
  horizontal = false,
  disabled = false,
  style,
}: RadioGroupProps<T>) {
  const { theme } = useTheme();

  return (
    <View style={style}>
      {label && (
        <Text variant="caption" style={styles.groupLabel}>
          {label}
        </Text>
      )}

      <View style={horizontal ? styles.horizontal : styles.vertical}>
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => !isDisabled && onChange(option.value)}
              activeOpacity={0.7}
              disabled={isDisabled}
              style={[
                styles.option,
                horizontal && index > 0 && { marginLeft: 20 },
                !horizontal && index > 0 && { marginTop: 12 },
              ]}
            >
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: error
                      ? theme.colors.error
                      : isSelected
                        ? theme.colors.textPrimary
                        : theme.colors.textDisabled,
                    opacity: isDisabled ? 0.5 : 1,
                  },
                ]}
              >
                {isSelected && (
                  <View
                    style={[styles.radioInner, { backgroundColor: theme.colors.textPrimary }]}
                  />
                )}
              </View>

              <Text color={isDisabled ? 'textDisabled' : 'textPrimary'} style={styles.label}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    marginBottom: 8,
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vertical: {
    flexDirection: 'column',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    marginLeft: 10,
  },
  error: {
    marginTop: 4,
  },
});
