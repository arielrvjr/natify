import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface ContainerProps {
  children: React.ReactNode;
  padding?: boolean;
  centered?: boolean;
  style?: ViewStyle;
}

/**
 * Contenedor principal con padding y fondo del tema
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  padding = true,
  centered = false,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        padding && { padding: theme.spacing.md },
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
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
