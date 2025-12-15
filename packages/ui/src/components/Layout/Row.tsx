import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

export interface RowProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de fila (flex horizontal)
 */
export const Row: React.FC<RowProps> = ({
  children,
  align = 'center',
  justify = 'start',
  gap = 0,
  wrap = false,
  style,
}) => {
  const { theme } = useTheme();

  const alignItems = {
    start: 'flex-start' as const,
    center: 'center' as const,
    end: 'flex-end' as const,
    stretch: 'stretch' as const,
    baseline: 'baseline' as const,
  };

  const justifyContent = {
    start: 'flex-start' as const,
    center: 'center' as const,
    end: 'flex-end' as const,
    between: 'space-between' as const,
    around: 'space-around' as const,
    evenly: 'space-evenly' as const,
  };

  const gapValue = typeof gap === 'number' ? gap : theme.spacing[gap];

  return (
    <View
      style={[
        styles.row,
        {
          alignItems: alignItems[align],
          justifyContent: justifyContent[justify],
          gap: gapValue,
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
