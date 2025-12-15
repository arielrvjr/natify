import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { DIContainer, container as globalContainer } from './Container';

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
 * @example
 * ```tsx
 * const loginUseCase = useUseCase<LoginUseCase>('auth:login');
 * ```
 */
export function useUseCase<T>(key: string): T {
  const container = useContext(DIContext);
  if (!container) {
    throw new Error('useUseCase must be used within DIProvider');
  }
  return useMemo(() => container.resolve<T>(key), [container, key]);
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
