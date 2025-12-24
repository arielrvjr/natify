import React, { ReactNode, ComponentType } from 'react';
import { NatifyProvider } from '../context/NatifyProvider';
import { ModuleProvider } from '../module/ModuleProvider';
import { AdapterMap } from '../types/adapters';
import { ModuleDefinition, RegisteredModule } from '../module/types';
import { SplashScreen, ErrorScreen as DefaultErrorScreen, ErrorScreenProps } from '../components';
import { validateNavigationAdapter } from './utils/validation';
import { useNatifyAppHandlers } from './hooks/useNatifyAppHandlers';

/**
 * Props del componente NatifyApp
 */
export interface NatifyAppProps {
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
   * @param modules - Módulos cargados
   * @param adapters - Adapters disponibles (para usar en UseCases)
   */
  onReady?: (modules: RegisteredModule[], adapters: AdapterMap) => void;

  /**
   * Callback en caso de error
   */
  onError?: (error: Error) => void;

  /**
   * Componente de error personalizado
   */
  errorScreen?: ComponentType<ErrorScreenProps>;
}

/**
 * Main Natify component
 *
 * Encapsulates all necessary configuration:
 * - NatifyProvider (DI + adapter registration)
 * - ModuleProvider (module system)
 * - NavigationContainer + AppNavigator
 *
 * @example
 * ```tsx
 * import { createReactNavigationAdapter } from '@natify/navigation-react';
 *
 * export default function App() {
 *   const navigationAdapter = createReactNavigationAdapter({
 *     theme: 'dark',
 *     screenOptions: {
 *       headerStyle: { backgroundColor: '#000' },
 *       headerTintColor: '#fff',
 *     },
 *   });
 *
 *   return (
 *     <NatifyApp
 *       adapters={{
 *         http: new AxiosHttpAdapter('https://api.example.com'),
 *         storage: new MMKVStorageAdapter(),
 *         navigation: navigationAdapter,
 *       }}
 *       modules={[AuthModule, ProductsModule]}
 *       initialModule="auth"
 *     />
 *   );
 * }
 * ```
 */

export const NatifyApp: React.FC<NatifyAppProps> = ({
  adapters,
  modules,
  initialModule,
  splashScreen,
  onReady,
  onError,
  errorScreen: _errorScreen,
}) => {
  // Validar adapter de navegación (lanza error si no es válido)
  const navigationAdapter = validateNavigationAdapter(adapters);
  const { NavigationContainer, AppNavigator, theme, screenOptions, deeplinkConfig } =
    navigationAdapter;

  // Manejar estado y handlers
  const [{ isReady, error }, { handleModulesLoaded, handleError, handleRetry }] =
    useNatifyAppHandlers(onReady, onError, adapters);

  // Pantalla de error
  if (error) {
    if (_errorScreen) {
      const CustomErrorScreen = _errorScreen;
      return <CustomErrorScreen error={error} retry={handleRetry} />;
    }
    return (
      <DefaultErrorScreen error={error} retry={handleRetry} title="Error al cargar la aplicación" />
    );
  }

  return (
    <NatifyProvider adapters={adapters}>
      <ModuleProvider modules={modules} onModulesLoaded={handleModulesLoaded} onError={handleError}>
        <NavigationContainer theme={theme} deeplinkConfig={deeplinkConfig}>
          {!isReady ? (
            splashScreen || <SplashScreen />
          ) : (
            <AppNavigator
              modules={modules}
              initialModule={initialModule}
              screenOptions={screenOptions}
            />
          )}
        </NavigationContainer>
      </ModuleProvider>
    </NatifyProvider>
  );
};
