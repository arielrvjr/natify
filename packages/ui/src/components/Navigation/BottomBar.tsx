import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Text } from '../Text';
import { Column } from '../Layout';

export interface BottomBarTab {
  /**
   * Identificador único del tab
   */
  id: string;
  
  /**
   * Etiqueta del tab
   */
  label: string;
  
  /**
   * Icono del tab (componente React)
   */
  icon?: React.ReactNode;
  
  /**
   * Badge opcional (número o texto)
   */
  badge?: string | number;
  
  /**
   * Deshabilitar el tab
   */
  disabled?: boolean;
}

export interface BottomBarProps {
  /**
   * Tabs a mostrar
   */
  tabs: BottomBarTab[];
  
  /**
   * ID del tab activo
   */
  activeTabId: string;
  
  /**
   * Callback cuando se selecciona un tab
   */
  onTabPress: (tabId: string) => void;
  
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
 * Barra de navegación inferior (Bottom Navigation/TabBar)
 * 
 * Soporta iconos, etiquetas y badges. Se adapta automáticamente
 * al tema claro/oscuro.
 */
export const BottomBar: React.FC<BottomBarProps> = ({
  tabs,
  activeTabId,
  onTabPress,
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
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopWidth: 1,
          borderTopColor: theme.colors.structure.divider,
          ...(elevated && theme.shadows.sm),
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isDisabled = tab.disabled;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => !isDisabled && onTabPress(tab.id)}
              disabled={isDisabled}
              style={[
                styles.tab,
                isActive && styles.tabActive,
                isDisabled && styles.tabDisabled,
              ]}
              activeOpacity={0.7}
            >
              <Column align="center" gap="xs">
                {/* Icono con badge */}
                <View style={styles.iconContainer}>
                  {tab.icon && (
                    <View
                      style={[
                        styles.icon,
                        isActive && styles.iconActive,
                        isDisabled && styles.iconDisabled,
                      ]}
                    >
                      {tab.icon}
                    </View>
                  )}
                  {tab.badge !== undefined && tab.badge !== null && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: theme.colors.status.error,
                        },
                      ]}
                    >
                      <Text
                        variant="caption"
                        color="onPrimary"
                        style={styles.badgeText}
                      >
                        {typeof tab.badge === 'number' && tab.badge > 99
                          ? '99+'
                          : String(tab.badge)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Label */}
                <Text
                  variant="caption"
                  color={isActive ? 'primary' : isDisabled ? 'tertiary' : 'secondary'}
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Column>
            </TouchableOpacity>
          );
        })}
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
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 48,
  },
  tabActive: {
    // Estilos adicionales para tab activo si es necesario
  },
  tabDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    // El color se maneja desde el componente icon pasado
  },
  iconDisabled: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '600',
  },
});

