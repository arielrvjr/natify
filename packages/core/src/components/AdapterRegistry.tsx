import React, { useEffect } from 'react';
import { AdapterMap } from '../types/adapters';
import { useUseCase } from '../di/DIProvider';
import { RegisterAdapterUseCase } from '../di/usecases';

/**
 * Props para el componente AdapterRegistry
 */
export interface AdapterRegistryProps {
  /**
   * Mapa de adapters a registrar en el contenedor DI
   */
  adapters: AdapterMap;
}

/**
 * Componente que registra adapters en el contenedor DI
 *
 * Usa el UseCase de registro de adapters. Los use cases del sistema
 * ya están inicializados por createDIProvider antes de que este componente se monte.
 *
 * @example
 * ```tsx
 * <AdapterRegistry adapters={{ http: httpAdapter, storage: storageAdapter }} />
 * ```
 */
export const AdapterRegistry: React.FC<AdapterRegistryProps> = ({ adapters }) => {
  // Obtener el UseCase (ya está inicializado por createDIProvider)
  const registerAdapter = useUseCase<RegisterAdapterUseCase>('usecase:RegisterAdapterUseCase');

  useEffect(() => {
    // Registrar todos los adapters usando el UseCase
    registerAdapter.executeMany(adapters);
  }, [adapters, registerAdapter]);

  return null;
};
