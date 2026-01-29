import React, { ReactNode } from 'react';
import { DIContainer } from './Container';
import { initializeSystemUseCases } from './initializeSystemUseCases';
import { DIProvider } from './DIProvider';

/**
 * Opciones para crear un DIProvider pre-configurado
 */
export interface CreateDIProviderOptions {
  /**
   * Si es true, inicializa los use cases del sistema (por defecto: true)
   * Los use cases del sistema son: RegisterAdapterUseCase, GetAdapterUseCase,
   * RegisterModuleUseCase, UnregisterModuleUseCase, GetModuleUseCase
   */
  initializeSystemUseCases?: boolean;
}

/**
 * Factory para crear un DIProvider pre-configurado
 *
 * Similar a createReactNavigationAdapter, esta función crea y configura
 * un DIProvider con los use cases del sistema del framework ya inicializados,
 * evitando problemas de timing en la inicialización.
 *
 * IMPORTANTE: Crea un container nuevo para cada instancia, evitando conflictos
 * entre múltiples instancias de la app.
 *
 * Los use cases del sistema se inicializan ANTES de que cualquier componente
 * intente usarlos, garantizando que estén disponibles desde el primer render.
 *
 * Los adapters se registran después a través de AdapterRegistry.
 *
 * @param options - Opciones de configuración del provider
 * @returns Un componente DIProvider pre-configurado y listo para usar
 *
 * @example
 * ```tsx
 * // Básico - inicializa use cases del sistema
 * const DIProvider = createDIProvider();
 * <DIProvider>
 *   <AdapterRegistry adapters={{ http, storage }} />
 *   {children}
 * </DIProvider>
 *
 * // Sin inicializar use cases del sistema (no recomendado)
 * const DIProvider = createDIProvider({
 *   initializeSystemUseCases: false,
 * });
 * ```
 */
export function createDIProvider(
  options?: CreateDIProviderOptions,
): React.FC<{ children: ReactNode }> {
  const { initializeSystemUseCases: shouldInitialize = true } = options || {};

  // Crear un container nuevo para esta instancia
  // Esto evita conflictos entre múltiples instancias de la app
  const container = new DIContainer();

  // Inicializar use cases del sistema del framework ANTES de cualquier cosa
  // Esto es crítico para que estén disponibles cuando AdapterRegistry o
  // ModuleProvider intenten usarlos
  if (shouldInitialize) {
    initializeSystemUseCases(container);
  }

  // Retornar el Provider ya configurado con el container que tiene
  // los use cases del sistema inicializados
  const ConfiguredDIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <DIProvider container={container}>{children}</DIProvider>;
  };

  return ConfiguredDIProvider;
}
