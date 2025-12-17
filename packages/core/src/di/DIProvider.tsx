import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { DIContainer, container as globalContainer } from './Container';
import { Port } from '../ports/Port';

/**
 * Contexto para el contenedor de DI
 */
const DIContext = createContext<DIContainer | null>(null);

interface DIProviderProps {
  container?: DIContainer;
  children: ReactNode;
}

/**
 * Provider para inyección de dependencias
 */
export const DIProvider: React.FC<DIProviderProps> = ({
  container = globalContainer,
  children,
}) => {
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
};

/**
 * Hook para acceder al contenedor de DI
 */
export function useDIContainer(): DIContainer {
  const container = useContext(DIContext);
  if (!container) {
    throw new Error('useDIContainer must be used within DIProvider');
  }
  return container;
}

/**
 * Hook para resolver un UseCase u otra dependencia
 *
 * Los UseCases se registran automáticamente cuando se carga un módulo
 * con el formato: `{moduleId}:{useCaseKey}`
 *
 * @example
 * ```tsx
 * const loginUseCase = useUseCase<LoginUseCase>('auth:login');
 * ```
 */
export function useUseCase<T>(key: string): T {
  const container = useDIContainer();
  if (!container) {
    throw new Error('useUseCase must be used within DIProvider');
  }
  return useMemo(() => container.resolve<T>(key), [container, key]);
}

/**
 * Hook para resolver un adapter del contenedor DI
 *
 * Los adapters se registran automáticamente cuando se inicializa NativefyApp
 * con el formato: `adapter:{name}` o `adapter:{capability}`
 *
 * Busca primero por nombre, luego por capability.
 *
 * @example
 * ```tsx
 * const http = useAdapter<HttpClientPort>('http');
 * // O por capability
 * const navigation = useAdapter<NavigationPort>('navigation');
 * ```
 */
export function useAdapter<T extends Port>(lookupKey: string): T {
  const container = useDIContainer();

  // Intentar primero por nombre (adapter:http, adapter:storage)
  const byName = container.tryResolve<T>(`adapter:${lookupKey}`);
  if (byName) {
    return byName;
  }

  // Si no encontramos por nombre, buscar por capability
  // Iterar sobre todas las keys registradas que empiecen con "adapter:"
  const adapterKeys = container.getKeys().filter(key => key.startsWith('adapter:'));

  for (const key of adapterKeys) {
    const adapter = container.tryResolve<Port>(key);
    if (adapter && adapter.capability === lookupKey) {
      return adapter as T;
    }
  }

  throw new Error(`[DI] No se encontró ningún adapter para "${lookupKey}"`);
}

/**
 * Hook para resolver múltiples UseCases
 *
 * @example
 * ```tsx
 * const { login, register } = useUseCases<{
 *   login: LoginUseCase;
 *   register: RegisterUseCase;
 * }>(['auth:login', 'auth:register']);
 * ```
 */
export function useUseCases<T extends Record<string, unknown>>(keys: string[]): T {
  const container = useContext(DIContext);
  if (!container) {
    throw new Error('useUseCases must be used within DIProvider');
  }

  return useMemo(() => {
    const resolved = {} as T;
    for (const key of keys) {
      const shortKey = key.split(':').pop() || key;
      (resolved as Record<string, unknown>)[shortKey] = container.resolve(key);
    }
    return resolved;
  }, [container, keys]);
}
