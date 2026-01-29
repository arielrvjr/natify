import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../Text';
import { Button } from '../Button';
import { Column } from '../Layout/Column';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Componente para estados vacíos
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <Column alignItems="center" gap="md" style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text variant="heading" align="center">
        {title}
      </Text>

      {description && (
        <Text variant="body" color="textSecondary" align="center" style={styles.description}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </Column>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
  },
  iconContainer: {
    marginBottom: 8,
  },
  description: {
    maxWidth: 280,
  },
});
