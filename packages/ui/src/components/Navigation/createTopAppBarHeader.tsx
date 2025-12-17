import React from 'react';
import { TopAppBar, TopAppBarProps } from './TopAppBar';

/**
 * Tipo para las opciones de navegación (compatible con React Navigation)
 */
export interface NavigationHeaderOptions {
  headerShown?: boolean;
  header?: (props: {
    navigation: {
      canGoBack: () => boolean;
      goBack: () => void;
    };
    route?: any;
  }) => React.ReactNode;
  headerShadowVisible?: boolean;
  [key: string]: any;
}

/**
 * Crea opciones de header para React Navigation usando TopAppBar
 *
 * @example
 * ```typescript
 * import { createTopAppBarHeader } from '@nativefy/ui';
 *
 * .screen({
 *   name: "Settings",
 *   component: SettingsScreen,
 *   options: createTopAppBarHeader({
 *     title: "Configuración",
 *     showBack: true,
 *   }),
 * })
 * ```
 */
export function createTopAppBarHeader(
  props: Omit<TopAppBarProps, 'onBackPress'> & {
    /**
     * Si showBack es true, usa navigation.goBack() automáticamente
     * Si necesitas lógica personalizada, usa onBackPress
     */
    onBackPress?: () => void;
  },
): NavigationHeaderOptions {
  return {
    headerShown: true,
    header: ({ navigation }) => {
      const handleBackPress = () => {
        if (props.onBackPress) {
          props.onBackPress();
        } else if (navigation.canGoBack()) {
          navigation.goBack();
        }
      };

      return (
        <TopAppBar
          {...props}
          showBack={props.showBack && navigation.canGoBack()}
          onBackPress={handleBackPress}
        />
      );
    },
    headerShadowVisible: false,
  };
}
