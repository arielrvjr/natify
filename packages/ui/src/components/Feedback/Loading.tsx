import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';

export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
}

/**
 * Componente de carga/loading
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  message,
  fullScreen = false,
  overlay = false,
  style,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={styles.content}>
      <ActivityIndicator size={size} color={color || theme.colors.accent} />
      {message && (
        <Text
          variant="caption"
          color={overlay ? 'textPrimary' : 'textSecondary'}
          style={{ marginTop: theme.spacing.md }}
        >
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen || overlay) {
    return (
      <View
        style={[
          styles.fullScreen,
          overlay && { backgroundColor: theme.colors.overlay },
          !overlay && { backgroundColor: theme.colors.background },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return <View style={[styles.inline, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  inline: {
    padding: 16,
    alignItems: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  content: {
    alignItems: 'center',
  },
});
