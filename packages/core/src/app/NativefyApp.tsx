import React, { ReactNode, useState, ComponentType, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { DIProvider, container, useDIContainer } from '../di';
import { ModuleProvider } from '../module/ModuleProvider';
import { AdapterMap, ModuleDefinition, RegisteredModule } from '../module/types';
import { Port } from '../ports/Port';

/**
 * Props del componente NativefyApp
 */
export interface NativefyAppProps {
  /**
   * Configuración de adapters
   */
  adapters: AdapterMap;

  /**
   * Módulos de la aplicación
   */
  modules: ModuleDefinition[];

  /**
   * ID del módulo inicial (por defecto el primero)
   */
  initialModule?: string;

  /**
   * Componente de splash mientras carga
   */
  splashScreen?: ReactNode;

  /**
   * Callback cuando la app está lista
   */
  onReady?: (modules: RegisteredModule[]) => void;

  /**
   * Callback en caso de error
   */
  onError?: (error: Error) => void;

  /**
   * Tema de navegación ('light' | 'dark' | objeto custom)
   */
  navigationTheme?: 'light' | 'dark' | object;

  /**
   * Opciones globales de pantallas
   */
  screenOptions?: object;

  /**
   * Componente de error personalizado
   */
  errorScreen?: ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Tipo extendido para el adapter de navegación
 */
interface NavigationAdapterWithComponents {
  capability: string;
  NavigationContainer: ComponentType<{
    children: ReactNode;
    theme?: 'light' | 'dark' | object;
    deeplinkConfig?: {
      prefixes: string[];
      config?: unknown;
      filter?: (url: string) => boolean;
      getInitialURL?: () => Promise<string | null | undefined>;
      subscribe?: (listener: (url: string) => void) => () => void;
    };
  }>;
  AppNavigator: ComponentType<{
    modules: ModuleDefinition[];
    initialModule?: string;
    screenOptions?: object;
  }>;
  deeplinkConfig?: {
    prefixes: string[];
    config?: unknown;
    filter?: (url: string) => boolean;
    getInitialURL?: () => Promise<string | null | undefined>;
    subscribe?: (listener: (url: string) => void) => () => void;
  };
}

/**
 * Componente principal de Nativefy
 *
 * Encapsula toda la configuración necesaria:
 * - DIProvider (inyección de dependencias)
 * - AdapterRegistry (registra adapters en DI)
 * - ModuleProvider (sistema de módulos)
 * - NavigationContainer + AppNavigator
 *
 * @example
 * ```tsx
 * export default function App() {
 *   return (
 *     <NativefyApp
 *       adapters={{
 *         http: new AxiosHttpAdapter('https://api.example.com'),
 *         storage: new MMKVStorageAdapter(),
 *         navigation: createReactNavigationAdapter(),
 *       }}
 *       modules={[AuthModule, ProductsModule]}
 *       initialModule="auth"
 *     />
 *   );
 * }
 * ```
 */
/**
 * Componente interno que registra adapters en DI
 */
const AdapterRegistry: React.FC<{ adapters: AdapterMap }> = ({ adapters }) => {
  const container = useDIContainer();

  useEffect(() => {
    // Registrar todos los adapters como singletons en el contenedor DI
    // Esto permite que UseCases y otros servicios resuelvan adapters directamente
    Object.entries(adapters).forEach(([key, adapter]) => {
      // Registrar por nombre (ej: "http", "storage")
      container.instance(`adapter:${key}`, adapter);

      // También registrar por capability para búsqueda por tipo
      if (adapter && typeof adapter === 'object' && 'capability' in adapter) {
        const capability = (adapter as Port).capability;
        container.instance(`adapter:${capability}`, adapter);
      }
    });
  }, [adapters, container]);

  return null;
};

export const NativefyApp: React.FC<NativefyAppProps> = ({
  adapters,
  modules,
  initialModule,
  splashScreen,
  onReady,
  onError,
  navigationTheme,
  screenOptions,
  errorScreen: ErrorScreen,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Obtener el adapter de navegación
  const navigationAdapter = adapters.navigation as NavigationAdapterWithComponents | undefined;

  if (!navigationAdapter) {
    throw new Error(
      '[NativefyApp] Navigation adapter is required. Add a navigation adapter to your config.',
    );
  }

  if (!navigationAdapter.NavigationContainer || !navigationAdapter.AppNavigator) {
    throw new Error(
      '[NativefyApp] Navigation adapter must provide NavigationContainer and AppNavigator components. ' +
        'Make sure you are using createReactNavigationAdapter() from @nativefy-adapter/navigation-react.',
    );
  }

  const { NavigationContainer, AppNavigator } = navigationAdapter;

  const handleModulesLoaded = (loadedModules: RegisteredModule[]) => {
    setIsReady(true);
    onReady?.(loadedModules);
  };

  const handleError = (err: Error) => {
    setError(err);
    onError?.(err);
  };

  const handleRetry = () => {
    setError(null);
    setIsReady(false);
    // Force re-mount by changing key would go here if needed
  };

  // Pantalla de error
  if (error) {
    if (ErrorScreen) {
      return <ErrorScreen error={error} retry={handleRetry} />;
    }
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error al cargar la aplicación</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  return (
    <DIProvider container={container}>
      <AdapterRegistry adapters={adapters} />
      <ModuleProvider modules={modules} onModulesLoaded={handleModulesLoaded} onError={handleError}>
        <NavigationContainer
          theme={navigationTheme}
          deeplinkConfig={navigationAdapter.deeplinkConfig}
        >
          {!isReady ? (
            splashScreen || <DefaultSplash />
          ) : (
            <AppNavigator
              modules={modules}
              initialModule={initialModule}
              screenOptions={screenOptions}
            />
          )}
        </NavigationContainer>
      </ModuleProvider>
    </DIProvider>
  );
};

/**
 * Props para el splash personalizado
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
 */
export const DefaultSplash: React.FC<SplashScreenProps> = ({
  message = 'Cargando...',
  color = '#007AFF',
  backgroundColor = '#FFFFFF',
  logo,
}) => (
  <View style={[styles.splashContainer, { backgroundColor }]}>
    {logo && <View style={styles.logoContainer}>{logo}</View>}
    <ActivityIndicator size="large" color={color} />
    <Text style={[styles.splashMessage, { color }]}>{message}</Text>
  </View>
);

/**
 * Props para la pantalla de error
 */
export interface ErrorScreenProps {
  error: Error;
  retry: () => void;
}

/**
 * Pantalla de error por defecto
 */
export const DefaultErrorScreen: React.FC<ErrorScreenProps> = ({ error, retry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorTitle}>Error al cargar</Text>
    <Text style={styles.errorMessage}>{error.message}</Text>
    <View style={styles.retryButton}>
      <Text style={styles.retryButtonText} onPress={retry}>
        Reintentar
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  splashMessage: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
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
