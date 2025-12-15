import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

export interface ColumnProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de columna (flex vertical)
 */
export const Column: React.FC<ColumnProps> = ({
  children,
  align = 'stretch',
  justify = 'start',
  gap = 0,
  style,
}) => {
  const { theme } = useTheme();

  const alignItems = {
    start: 'flex-start' as const,
    center: 'center' as const,
    end: 'flex-end' as const,
    stretch: 'stretch' as const,
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
        styles.column,
        {
          alignItems: alignItems[align],
          justifyContent: justifyContent[justify],
          gap: gapValue,
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
    flex: 1,
    flexDirection: 'column',
  },
});
