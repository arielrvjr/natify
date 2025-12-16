import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, FlexAlignType, FlexStyle } from 'react-native';
import { Spacing, useTheme } from '../../theme';

export interface ColumnProps {
  children: React.ReactNode;
  alignItems?: FlexAlignType;
  justifyContent?: FlexStyle['justifyContent'];
  paddingHorizontal?: keyof Spacing;
  paddingVertical?: keyof Spacing;

  gap?: keyof Spacing | number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de columna (flex vertical)
 */
export const Column: React.FC<ColumnProps> = ({
  children,
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  paddingHorizontal = 'none',
  paddingVertical = 'none',
  gap = 0,
  style,
}) => {
  const { theme } = useTheme();

  const gapValue = typeof gap === 'number' ? gap : theme.spacing[gap];

  return (
    <View
      style={[
        styles.column,
        {
          alignItems,
          justifyContent,
          gap: gapValue,
          paddingHorizontal: theme.spacing[paddingHorizontal],
          paddingVertical: theme.spacing[paddingVertical],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
});
