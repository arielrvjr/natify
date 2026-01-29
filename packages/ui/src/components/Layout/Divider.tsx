import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface DividerProps {
  vertical?: boolean;
  color?: string;
  thickness?: number;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | number;
  style?: ViewStyle;
}

/**
 * Componente de divisor/separador
 */
export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  color,
  thickness = 1,
  spacing = 'md',
  style,
}) => {
  const { theme } = useTheme();

  const spacingValue = typeof spacing === 'number' ? spacing : theme.spacing[spacing];

  if (vertical) {
    return (
      <View
        style={[
          {
            width: thickness,
            backgroundColor: color || theme.colors.textDisabled,
            marginHorizontal: spacingValue,
            alignSelf: 'stretch',
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: color || theme.colors.textDisabled,
          marginVertical: spacingValue,
        },
        style,
      ]}
    />
  );
};
