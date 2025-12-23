import React from 'react';
import { AdapterMap } from '../../types/adapters';

/**
 * Tipo extendido para el adapter de navegación con componentes React
 */
export interface NavigationAdapterWithComponents {
  capability: string;
  NavigationContainer: React.ComponentType<{
    children: React.ReactNode;
    theme?: 'light' | 'dark' | object;
    deeplinkConfig?: {
      prefixes: string[];
      config?: unknown;
      filter?: (url: string) => boolean;
      getInitialURL?: () => Promise<string | null | undefined>;
      subscribe?: (listener: (url: string) => void) => () => void;
    };
  }>;
  AppNavigator: React.ComponentType<{
    modules: unknown[];
    initialModule?: string;
    screenOptions?: object;
  }>;
  /**
   * Configuración de deeplinks (opcional)
   */
  deeplinkConfig?: {
    prefixes: string[];
    config?: unknown;
    filter?: (url: string) => boolean;
    getInitialURL?: () => Promise<string | null | undefined>;
    subscribe?: (listener: (url: string) => void) => () => void;
  };
  /**
   * Tema de navegación (opcional, puede venir del adapter)
   */
  theme?: 'light' | 'dark' | object;
  /**
   * Opciones globales de pantallas (opcional, puede venir del adapter)
   */
  screenOptions?: object;
}

/**
 * Valida que el adapter de navegación esté presente y tenga los componentes necesarios
 *
 * @param adapters - Mapa de adapters
 * @throws Error si el adapter de navegación no está presente o no tiene los componentes necesarios
 */
export function validateNavigationAdapter(adapters: AdapterMap): NavigationAdapterWithComponents {
  const navigationAdapter = adapters.navigation as NavigationAdapterWithComponents | undefined;

  if (!navigationAdapter) {
    throw new Error(
      '[NativefyApp] Navigation adapter is required. Add a navigation adapter to your config.',
    );
  }

  if (!navigationAdapter.NavigationContainer || !navigationAdapter.AppNavigator) {
    throw new Error(
      '[NativefyApp] Navigation adapter must provide NavigationContainer and AppNavigator components. ' +
        'Make sure you are using createReactNavigationAdapter() from @nativefy/navigation-react.',
    );
  }

  return navigationAdapter;
}
