import React, { ReactNode } from 'react';
import { DIProvider } from '../di/DIProvider';
import { container } from '../di/Container';
import { AdapterMap } from '../types/adapters';
import { AdapterRegistry } from '../components/AdapterRegistry';
import { UseCaseProvider } from '../di/UseCaseProvider';

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
      <UseCaseProvider>
        <AdapterRegistry adapters={adapters} />
        {children}
      </UseCaseProvider>
    </DIProvider>
  );
};
