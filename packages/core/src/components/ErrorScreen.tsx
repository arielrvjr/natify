import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

/**
 * Props para la pantalla de error
 */
export interface ErrorScreenProps {
  /** Error que se debe mostrar */
  error: Error;
  /** Función para reintentar la operación */
  retry: () => void;
  /** Título personalizado */
  title?: string;
  /** Color del título */
  titleColor?: string;
  /** Color del mensaje */
  messageColor?: string;
  /** Color de fondo */
  backgroundColor?: string;
  /** Color del botón de reintentar */
  retryButtonColor?: string;
  /** Texto del botón de reintentar */
  retryButtonText?: string;
}

/**
 * Pantalla de error por defecto
 *
 * Muestra un mensaje de error con opción de reintentar.
 *
 * @example
 * ```tsx
 * <ErrorScreen
 *   error={error}
 *   retry={handleRetry}
 *   title="Error al cargar"
 *   retryButtonText="Intentar de nuevo"
 * />
 * ```
 */
export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  retry,
  title = 'Error al cargar',
  titleColor = '#FF3B30',
  messageColor = '#666666',
  backgroundColor = '#FFFFFF',
  retryButtonColor = '#007AFF',
  retryButtonText = 'Reintentar',
}) => (
  <View style={[styles.container, { backgroundColor }]}>
    <Text style={styles.icon}>⚠️</Text>
    <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
    <Text style={[styles.message, { color: messageColor }]}>{error.message}</Text>
    <View style={[styles.retryButton, { backgroundColor: retryButtonColor }]}>
      <Text style={styles.retryButtonText} onPress={retry}>
        {retryButtonText}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
