import React, { useEffect, useMemo, ReactNode } from 'react';
import { DIProvider, useDIContainer } from '../di/DIProvider';
import { container } from '../di/Container';
import { AdapterMap } from '../module/types';
import { Port } from '../ports/Port';
import { ConsoleLoggerAdapter } from '../adapters/logger/ConsoleLoggerAdapter';

interface NativefyProviderProps {
  /**
   * Mapa de adapters a registrar en el contenedor DI
   *
   * @example
   * ```tsx
   * const adapters = {
   *   http: new AxiosHttpAdapter('https://api.example.com'),
   *   storage: new MMKVStorageAdapter(),
   *   navigation: createReactNavigationAdapter(),
   * };
   * ```
   */
  adapters: AdapterMap;
  children: ReactNode;
}

/**
 * Componente interno que registra adapters en el contenedor DI
 */
const AdapterRegistry: React.FC<{ adapters: AdapterMap }> = ({ adapters }) => {
  const container = useDIContainer();

  // Agregar logger por defecto si no está presente
  const finalAdapters = useMemo(() => ({ ...adapters }), [adapters]);
  if (!finalAdapters.logger) {
    finalAdapters.logger = new ConsoleLoggerAdapter();
  }

  // Registrar logger de forma síncrona si no está ya registrado
  if (!container.tryResolve('adapter:logger')) {
    const loggerAdapter = finalAdapters.logger;
    container.instance('adapter:logger', loggerAdapter);
  }

  useEffect(() => {
    // Registrar todos los adapters como singletons en el contenedor DI
    // Esto permite que UseCases y otros servicios resuelvan adapters directamente
    Object.entries(finalAdapters).forEach(([key, adapter]) => {
      // Registrar por nombre (ej: "http", "storage")
      container.instance(`adapter:${key}`, adapter);

      // También registrar por capability para búsqueda por tipo
      if (adapter && typeof adapter === 'object' && 'capability' in adapter) {
        const capability = (adapter as Port).capability;
        container.instance(`adapter:${capability}`, adapter);
      }
    });
  }, [finalAdapters, container]);

  return null;
};

/**
 * Provider principal de Nativefy para el Nivel 1 (Solo Abstracción)
 *
 * Encapsula el DIProvider y el registro automático de adapters.
 * Ideal para proyectos existentes que solo necesitan abstraer librerías nativas.
 *
 * @example
 * ```tsx
 * import { NativefyProvider } from '@nativefy/core';
 * import { AxiosHttpAdapter } from '@nativefy/http-axios';
 * import { MMKVStorageAdapter } from '@nativefy/storage-mmkv';
 *
 * export default function App() {
 *   return (
 *     <NativefyProvider
 *       adapters={{
 *         http: new AxiosHttpAdapter('https://api.example.com'),
 *         storage: new MMKVStorageAdapter(),
 *       }}
 *     >
 *       <YourApp />
 *     </NativefyProvider>
 *   );
 * }
 * ```
 */
export const NativefyProvider: React.FC<NativefyProviderProps> = ({ adapters, children }) => {
  return (
    <DIProvider container={container}>
      <AdapterRegistry adapters={adapters} />
      {children}
    </DIProvider>
  );
};
