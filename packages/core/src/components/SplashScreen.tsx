import React, { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

/**
 * Props para el splash screen
 */
export interface SplashScreenProps {
  /** Mensaje de carga opcional */
  message?: string;
  /** Color primario del indicador */
  color?: string;
  /** Color de fondo */
  backgroundColor?: string;
  /** Logo personalizado */
  logo?: ReactNode;
}

/**
 * Splash screen por defecto con opciones de personalización
 *
 * @example
 * ```tsx
 * <SplashScreen
 *   message="Cargando aplicación..."
 *   color="#007AFF"
 *   backgroundColor="#FFFFFF"
 *   logo={<Image source={require('./logo.png')} />}
 * />
 * ```
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  message = 'Cargando...',
  color = '#007AFF',
  backgroundColor = '#FFFFFF',
  logo,
}) => (
  <View style={[styles.container, { backgroundColor }]}>
    {logo && <View style={styles.logoContainer}>{logo}</View>}
    <ActivityIndicator size="large" color={color} />
    <Text style={[styles.message, { color }]}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});
