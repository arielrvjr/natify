import React, { ReactNode } from 'react';
import { DIProvider } from '../di/DIProvider';
import { container } from '../di/Container';
import { AdapterMap } from '../types/adapters';
import { AdapterRegistry } from '../components/AdapterRegistry';
import { UseCaseProvider } from '../di/UseCaseProvider';

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
 * Encapsulates DIProvider and automatic adapter registration.
 * Ideal for existing projects that only need to abstract native libraries.
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
export const NatifyProvider: React.FC<NatifyProviderProps> = ({ adapters, children }) => {
  return (
    <DIProvider container={container}>
      <UseCaseProvider>
        <AdapterRegistry adapters={adapters} />
        {children}
      </UseCaseProvider>
    </DIProvider>
  );
};
