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
 * Props del NavigationContainer wrapper
 */
interface NavigationContainerWrapperProps {
  children: ReactNode;
  theme?: 'light' | 'dark' | object;
}

/**
 * Tipo del adapter de navegación con componentes
 */
export interface ReactNavigationAdapterType extends NavigationPort {
  navigationRef: NavigationContainerRef<ParamListBase>;
  NavigationContainer: ComponentType<NavigationContainerWrapperProps>;
  AppNavigator: ComponentType<AppNavigatorProps>;
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
    const initialRouteName = useMemo(() => {
      if (initialModule) {
        const module = modules.find(m => m.id === initialModule);
        if (module) {
          return `${module.id}/${module.initialRoute}`;
        }
      }
      // Por defecto, la primera pantalla del primer módulo
      const firstModule = modules[0];
      if (firstModule) {
        return `${firstModule.id}/${firstModule.initialRoute}`;
      }
      return undefined;
    }, [modules, initialModule]);

    if (isLoading || !initialRouteName || modules.length === 0) {
      return null;
    }

    return (
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions as any}>
        {modules.map(module =>
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
 * Crea un wrapper del NavigationContainer
 */
function createNavigationContainerWrapper(
  navigationRef: NavigationContainerRef<ParamListBase>,
): ComponentType<NavigationContainerWrapperProps> {
  return function NavigationContainerWrapper({ children, theme }: NavigationContainerWrapperProps) {
    const resolvedTheme = useMemo((): Theme | undefined => {
      if (theme === 'dark') return DarkTheme;
      if (theme === 'light') return DefaultTheme;
      if (typeof theme === 'object') return theme as Theme;
      return DefaultTheme;
    }, [theme]);

    return (
      <NavigationContainer ref={navigationRef as any} theme={resolvedTheme}>
        {children}
      </NavigationContainer>
    );
  };
}

/**
 * Factory para crear el adapter de navegación
 *
 * @example
 * ```typescript
 * const navigationAdapter = createReactNavigationAdapter();
 *
 * // En NativefyApp
 * <NativefyApp
 *   adapters={{ navigation: navigationAdapter }}
 *   modules={[...]}
 * />
 * ```
 */
export function createReactNavigationAdapter(): ReactNavigationAdapterType {
  // Crear la ref de navegación
  const navigationRef = createNavigationContainerRef<ParamListBase>();

  // Crear componentes
  const NavigationContainerComponent = createNavigationContainerWrapper(navigationRef);
  const AppNavigatorComponent = createAppNavigator(navigationRef);

  // El adapter con todos los métodos de NavigationPort
  const adapter: ReactNavigationAdapterType = {
    capability: 'navigation',
    navigationRef,

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
