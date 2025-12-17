import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Text } from '../Text';
import { Row } from '../Layout';
import { Icon } from '../Icon';

export interface TopAppBarAction {
  icon?: React.ReactNode;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
}

export interface TopAppBarProps {
  /**
   * Título de la barra
   */
  title?: string;

  /**
   * Subtítulo opcional
   */
  subtitle?: string;

  /**
   * Mostrar botón de retroceso
   */
  showBack?: boolean;

  /**
   * Callback cuando se presiona el botón de retroceso
   */
  onBackPress?: () => void;

  /**
   * Acciones a la derecha (máximo 3 recomendado)
   */
  actions?: TopAppBarAction[];

  /**
   * Contenido personalizado en lugar de título
   */
  children?: React.ReactNode;

  /**
   * Elevación de la barra (sombra)
   */
  elevated?: boolean;

  /**
   * Color de fondo personalizado
   */
  backgroundColor?: string;

  /**
   * Estilos personalizados
   */
  style?: ViewStyle;
}

/**
 * Barra superior de la aplicación (AppBar/Header)
 *
 * Soporta título, subtítulo, botón de retroceso y acciones.
 * Se adapta automáticamente al tema claro/oscuro.
 */
export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  actions = [],
  children,
  elevated = true,
  backgroundColor,
  style,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const bgColor = backgroundColor || theme.colors.surface.secondary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingTop: insets.top,
          ...(elevated && theme.shadows.sm),
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Row
          alignItems="center"
          justifyContent="space-between"
          padding="md"
          style={styles.row}
          id="top-app-bar-content"
        >
          <Row alignItems="center" style={styles.leftSection}>
            {showBack && (
              <TouchableOpacity
                onPress={onBackPress}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="ArrowLeft" size={24} color="primary" />
              </TouchableOpacity>
            )}

            {children || (
              <View style={styles.titleContainer}>
                {title && (
                  <Text variant="title" color="primary" numberOfLines={1}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text variant="caption" color="secondary" numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
          </Row>
          {actions.length > 0 && (
            <Row alignItems="center" gap="sm">
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  style={[styles.actionButton, action.disabled && styles.actionButtonDisabled]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {action.icon && <View style={styles.actionIcon}>{action.icon}</View>}
                  {action.label && (
                    <Text
                      variant="label"
                      color={action.disabled ? 'tertiary' : 'primary'}
                      style={styles.actionLabel}
                    >
                      {action.label}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </Row>
          )}
        </Row>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  content: {
    height: 56, // Altura estándar de AppBar
    paddingHorizontal: 16,
  },
  row: {
    height: '100%',
  },
  leftSection: {
    flex: 1,
    minWidth: 0, // Permite que el texto se trunque
  },
  backButton: {
    marginRight: 8,
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionLabel: {
    marginLeft: 4,
  },
});
