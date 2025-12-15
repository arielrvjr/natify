import React, { ReactNode, useState, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NativefyProvider } from '../context/NativefyProvider';
import { DIProvider, container } from '../di';
import { ModuleProvider } from '../module/ModuleProvider';
import { AdapterMap, ModuleDefinition, RegisteredModule } from '../module/types';

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
  }>;
  AppNavigator: ComponentType<{
    modules: ModuleDefinition[];
    initialModule?: string;
    screenOptions?: object;
  }>;
}

/**
 * Componente principal de Nativefy
 *
 * Encapsula toda la configuración necesaria:
 * - NativefyProvider (adapters)
 * - DIProvider (inyección de dependencias)
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
    <NativefyProvider config={adapters}>
      <DIProvider container={container}>
        <ModuleProvider
          modules={modules}
          onModulesLoaded={handleModulesLoaded}
          onError={handleError}
        >
          <NavigationContainer theme={navigationTheme}>
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
    </NativefyProvider>
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
