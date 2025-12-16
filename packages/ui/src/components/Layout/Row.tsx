import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, FlexAlignType, FlexStyle } from 'react-native';
import { Spacing, useTheme } from '../../theme';

export interface RowProps {
  children: React.ReactNode;
  alignItems?: FlexAlignType;
  justifyContent?: FlexStyle['justifyContent'];
  paddingHorizontal?: keyof Spacing;
  paddingVertical?: keyof Spacing;
  gap?: keyof Spacing | number;
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de fila (flex horizontal)
 */
export const Row: React.FC<RowProps> = ({
  children,
  alignItems = 'center',
  justifyContent = 'flex-start',
  paddingHorizontal = 'none',
  paddingVertical = 'none',
  gap = 0,
  wrap = false,
  style,
}) => {
  const { theme } = useTheme();

  const gapValue = typeof gap === 'number' ? gap : theme.spacing[gap];

  return (
    <View
      style={[
        styles.row,
        {
          alignItems,
          justifyContent,
          gap: gapValue,
          paddingHorizontal: theme.spacing[paddingHorizontal],
          paddingVertical: theme.spacing[paddingVertical],
          flexWrap: (wrap ? 'wrap' : 'nowrap') as 'wrap' | 'nowrap',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
