import React, { useMemo, ReactNode, ComponentType } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
  createNavigationContainerRef,
  CommonActions,
  StackActions,
  ParamListBase,
  DefaultTheme,
  DarkTheme,
  Theme,
  LinkingOptions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NavigationPort,
  NavigationParams,
  NavigationOptions,
  ScreenOptions,
  NavigationListener,
  ModuleDefinition,
  useModules,
} from '@nativefy/core';

const Stack = createNativeStackNavigator();

/**
 * Props del AppNavigator
 */
interface AppNavigatorProps {
  modules: ModuleDefinition[];
  initialModule?: string;
  screenOptions?: object;
}

/**
 * Configuración de deeplinks
 */
export interface DeeplinkConfig {
  /**
   * Prefijos de URL que activan deeplinks
   * Ejemplo: ['myapp://', 'https://myapp.com', 'https://*.myapp.com']
   */
  prefixes: string[];

  /**
   * Configuración personalizada de linking (opcional)
   * Si no se proporciona, se genera automáticamente desde los módulos
   */
  config?: LinkingOptions<ParamListBase>['config'];

  /**
   * Función para filtrar o transformar URLs antes de procesarlas
   */
  filter?: (url: string) => boolean;

  /**
   * Función para obtener el estado inicial desde una URL
   */
  getInitialURL?: () => Promise<string | null | undefined>;

  /**
   * Función para suscribirse a cambios de URL
   */
  subscribe?: (listener: (url: string) => void) => () => void;
}

/**
 * Props del NavigationContainer wrapper
 */
interface NavigationContainerWrapperProps {
  children: ReactNode;
  theme?: 'light' | 'dark' | object;
  deeplinkConfig?: DeeplinkConfig;
}

/**
 * Tipo del adapter de navegación con componentes
 */
export interface ReactNavigationAdapterType extends NavigationPort {
  navigationRef: NavigationContainerRef<ParamListBase>;
  NavigationContainer: ComponentType<NavigationContainerWrapperProps>;
  AppNavigator: ComponentType<AppNavigatorProps>;
  /**
   * Configuración de deeplinks
   */
  deeplinkConfig?: DeeplinkConfig;
}

/**
 * Componente AppNavigator que renderiza las pantallas de todos los módulos
 */
function createAppNavigator(
  _navigationRef: NavigationContainerRef<ParamListBase>,
): ComponentType<AppNavigatorProps> {
  return function AppNavigator({ initialModule, screenOptions }: AppNavigatorProps) {
    const { modules, isLoading } = useModules();

    // Determinar la ruta inicial
    // Filtrar módulos sin pantallas (módulos compartidos)
    const modulesWithScreens = useMemo(() => modules.filter(m => m.screens.length > 0), [modules]);

    const initialRouteName = useMemo(() => {
      if (initialModule) {
        const module = modulesWithScreens.find(m => m.id === initialModule);
        if (module && module.initialRoute) {
          return `${module.id}/${module.initialRoute}`;
        }
      }
      // Por defecto, la primera pantalla del primer módulo con pantallas
      const firstModule = modulesWithScreens[0];
      if (firstModule && firstModule.initialRoute) {
        return `${firstModule.id}/${firstModule.initialRoute}`;
      }
      return undefined;
    }, [modulesWithScreens, initialModule]);

    if (isLoading || !initialRouteName || modules.length === 0) {
      return null;
    }

    return (
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions as any}>
        {modulesWithScreens.map(module =>
          module.screens.map(screen => (
            <Stack.Screen
              key={`${module.id}/${screen.name}`}
              name={`${module.id}/${screen.name}`}
              component={screen.component}
              options={screen.options as any}
            />
          )),
        )}
      </Stack.Navigator>
    );
  };
}

/**
 * Genera la configuración de linking automáticamente desde los módulos
 * Usa la configuración de deeplink de cada pantalla si existe,
 * o genera automáticamente si no está definida
 */
function generateLinkingConfig(
  modules: ModuleDefinition[],
  customConfig?: LinkingOptions<ParamListBase>['config'],
): LinkingOptions<ParamListBase>['config'] {
  // Si hay configuración personalizada global, usarla (override completo)
  if (customConfig) {
    return customConfig;
  }

  // Generar configuración desde las definiciones de pantallas
  const screens: Record<string, any> = {};

  modules.forEach(module => {
    module.screens.forEach(screen => {
      const routeName = `${module.id}/${screen.name}`;

      // Si la pantalla tiene configuración de deeplink personalizada
      if (screen.deeplink) {
        const deeplinkConfig: any = {};

        // Path personalizado o generado automáticamente
        if (screen.deeplink?.path) {
          deeplinkConfig.path = screen.deeplink?.path;
        } else {
          // Generar path automáticamente desde el nombre
          // Ejemplo: "ProductDetail" -> "productdetail" o "product-detail"
          const autoPath = screen.name
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/^-/, '');
          deeplinkConfig.path = `${module.id}/${autoPath}`;
        }

        // Parse personalizado
        if (screen.deeplink.parse) {
          deeplinkConfig.parse = screen.deeplink.parse;
        }

        // Stringify personalizado
        if (screen.deeplink?.stringify) {
          deeplinkConfig.stringify = screen.deeplink?.stringify;
        }

        screens[routeName] = deeplinkConfig;
      } else {
        // Generación automática: convertir nombre a path
        // Ejemplo: "auth/Login" -> "auth/login"
        // Ejemplo: "products/ProductDetail" -> "products/productdetail"
        const autoPath = `${module.id}/${screen.name.toLowerCase()}`;
        screens[routeName] = autoPath;
      }
    });
  });

  return {
    screens,
    initialRouteName: undefined, // Se determina automáticamente
  };
}

/**
 * Crea un wrapper del NavigationContainer
 */
function createNavigationContainerWrapper(
  navigationRef: NavigationContainerRef<ParamListBase>,
): ComponentType<NavigationContainerWrapperProps> {
  return function NavigationContainerWrapper({
    children,
    theme,
    deeplinkConfig,
  }: NavigationContainerWrapperProps) {
    const { modules } = useModules();

    const resolvedTheme = useMemo((): Theme | undefined => {
      if (theme === 'dark') return DarkTheme;
      if (theme === 'light') return DefaultTheme;
      if (typeof theme === 'object') return theme as Theme;
      return DefaultTheme;
    }, [theme]);

    const linking = useMemo((): LinkingOptions<ParamListBase> | undefined => {
      if (!deeplinkConfig) {
        return undefined;
      }

      return {
        prefixes: deeplinkConfig.prefixes,
        config: generateLinkingConfig(modules, deeplinkConfig.config),
        filter: deeplinkConfig.filter,
        getInitialURL: deeplinkConfig.getInitialURL,
        subscribe: deeplinkConfig.subscribe,
      };
    }, [deeplinkConfig, modules]);

    return (
      <NavigationContainer ref={navigationRef as any} theme={resolvedTheme} linking={linking}>
        {children}
      </NavigationContainer>
    );
  };
}

/**
 * Factory para crear el adapter de navegación
 *
 * @param deeplinkConfig Configuración opcional de deeplinks
 *
 * @example
 * ```typescript
 * // Sin deeplinks
 * const navigationAdapter = createReactNavigationAdapter();
 *
 * // Con deeplinks
 * const navigationAdapter = createReactNavigationAdapter({
 *   prefixes: ['myapp://', 'https://myapp.com'],
 * });
 *
 * // En NativefyApp
 * <NativefyApp
 *   adapters={{ navigation: navigationAdapter }}
 *   modules={[...]}
 * />
 * ```
 */
export function createReactNavigationAdapter(
  deeplinkConfig?: DeeplinkConfig,
): ReactNavigationAdapterType {
  // Crear la ref de navegación
  const navigationRef = createNavigationContainerRef<ParamListBase>();

  // Crear componentes
  const NavigationContainerComponent = createNavigationContainerWrapper(navigationRef);
  const AppNavigatorComponent = createAppNavigator(navigationRef);

  // El adapter con todos los métodos de NavigationPort
  const adapter: ReactNavigationAdapterType = {
    capability: 'navigation',
    navigationRef,
    deeplinkConfig,

    // Componentes
    NavigationContainer: NavigationContainerComponent,
    AppNavigator: AppNavigatorComponent,

    // Métodos de navegación
    navigate<T extends NavigationParams>(
      routeName: string,
      params?: T,
      options?: NavigationOptions,
    ): void {
      if (!navigationRef.isReady()) {
        console.warn('[Navigation] Not ready. Make sure NavigationContainer is mounted.');
        return;
      }

      if (options?.replace) {
        navigationRef.dispatch(StackActions.replace(routeName, params));
        return;
      }

      navigationRef.navigate(routeName, params);
    },

    goBack(): boolean {
      if (!navigationRef.isReady() || !navigationRef.canGoBack()) {
        return false;
      }
      navigationRef.goBack();
      return true;
    },

    popToTop(): void {
      if (!navigationRef.isReady()) return;
      navigationRef.dispatch(StackActions.popToTop());
    },

    replace<T extends NavigationParams>(routeName: string, params?: T): void {
      if (!navigationRef.isReady()) return;
      navigationRef.dispatch(StackActions.replace(routeName, params));
    },

    reset(routes: Array<{ name: string; params?: NavigationParams }>): void {
      if (!navigationRef.isReady()) return;
      navigationRef.dispatch(
        CommonActions.reset({
          index: routes.length - 1,
          routes,
        }),
      );
    },

    getCurrentRoute(): string | undefined {
      if (!navigationRef.isReady()) return undefined;
      return navigationRef.getCurrentRoute()?.name;
    },

    getCurrentParams<T extends NavigationParams>(): T | undefined {
      if (!navigationRef.isReady()) return undefined;
      return navigationRef.getCurrentRoute()?.params as T | undefined;
    },

    canGoBack(): boolean {
      if (!navigationRef.isReady()) return false;
      return navigationRef.canGoBack();
    },

    setOptions(_options: ScreenOptions): void {
      if (!navigationRef.isReady()) return;
      // setOptions requiere estar en el contexto de una pantalla
      // Este método es más útil dentro de componentes usando useNavigation
      console.warn('[Navigation] setOptions should be called from within a screen component');
    },

    addListener(
      event: 'focus' | 'blur' | 'beforeRemove' | 'state',
      callback: NavigationListener,
    ): () => void {
      if (!navigationRef.isReady()) {
        return () => {};
      }

      const unsubscribe = navigationRef.addListener(event as any, (e: any) => {
        callback({ type: event, data: e.data });
      });

      return unsubscribe;
    },
  };

  return adapter;
}

// Re-exportar hooks útiles de React Navigation
export { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

// Re-exportar tipos útiles
export type { NavigationContainerRef, ParamListBase } from '@react-navigation/native';
export type { NativeStackNavigationProp } from '@react-navigation/native-stack';
