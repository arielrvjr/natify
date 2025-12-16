import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Spacing } from '../../theme';

export interface ContainerProps {
  children: React.ReactNode;
  padding?: boolean | keyof Spacing;
  paddingHorizontal?: keyof Spacing;
  paddingVertical?: keyof Spacing;
  centered?: boolean;
  style?: ViewStyle;
}

/**
 * Contenedor principal con padding y fondo del tema
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  padding = true,
  paddingHorizontal,
  paddingVertical,
  centered = false,
  style,
}) => {
  const { theme } = useTheme();

  const paddingValue = typeof padding === 'boolean' ? (padding ? 'md' : 'none') : padding;

  const horizontalPadding = paddingHorizontal || paddingValue;
  const verticalPadding = paddingVertical || paddingValue;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface.primary },
        {
          paddingHorizontal: theme.spacing[horizontalPadding],
          paddingVertical: theme.spacing[verticalPadding],
        },
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
