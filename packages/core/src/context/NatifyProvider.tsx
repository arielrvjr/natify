import React, { ReactNode } from 'react';
import { createDIProvider } from '../di/createDIProvider';
import { AdapterMap } from '../types/adapters';
import { AdapterRegistry } from '../components';

interface NatifyProviderProps {
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
 * Main Natify provider for Level 1 (Abstraction Only)
 *
 * Encapsula DIProvider y registro automático de adapters.
 * Ideal para proyectos existentes que solo necesitan abstraer librerías nativas.
 *
 * Responsabilidades:
 * 1. Crea DIProvider con use cases del sistema ya inicializados (createDIProvider)
 * 2. Registra adapters automáticamente (AdapterRegistry)
 * 3. Proporciona logger por defecto si no se proporciona uno
 *
 * Flujo interno:
 * - createDIProvider() crea container nuevo e inicializa use cases + logger
 * - AdapterRegistry registra los adapters usando RegisterAdapterUseCase
 *
 * @example
 * ```tsx
 * import { NatifyProvider } from '@natify/core';
 * import { AxiosHttpAdapter } from '@natify/http-axios';
 * import { MMKVStorageAdapter } from '@natify/storage-mmkv';
 *
 * export default function App() {
 *   return (
 *     <NatifyProvider
 *       adapters={{
 *         http: new AxiosHttpAdapter('https://api.example.com'),
 *         storage: new MMKVStorageAdapter(),
 *       }}
 *     >
 *       <YourApp />
 *     </NatifyProvider>
 *   );
 * }
 * ```
 */
const ConfiguredDIProvider = createDIProvider({
  initializeSystemUseCases: true,
});
export const NatifyProvider: React.FC<NatifyProviderProps> = ({ adapters, children }) => {
  return (
    <ConfiguredDIProvider>
      <AdapterRegistry adapters={adapters} />
      {children}
    </ConfiguredDIProvider>
  );
};
