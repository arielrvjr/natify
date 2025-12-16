import React from 'react';
import { Switch as RNSwitch, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';
import { Row } from '../Layout/Row';

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Componente de switch/toggle
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  label,
  labelPosition = 'left',
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  const labelElement = label && (
    <Text
      color={disabled ? 'tertiary' : 'primary'}
      style={labelPosition === 'left' ? styles.labelLeft : styles.labelRight}
    >
      {label}
    </Text>
  );

  return (
    <Row align="center" style={style}>
      {labelPosition === 'left' && labelElement}

      <RNSwitch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.structure.border,
          true: theme.colors.action.pressed,
        }}
        thumbColor={value ? theme.colors.action.primary : theme.colors.surface.primary}
        ios_backgroundColor={theme.colors.structure.border}
      />

      {labelPosition === 'right' && labelElement}
    </Row>
  );
};

const styles = StyleSheet.create({
  labelLeft: {
    marginRight: 12,
    flex: 1,
  },
  labelRight: {
    marginLeft: 12,
    flex: 1,
  },
});
