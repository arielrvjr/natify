import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Port } from '../ports/Port';
import { ConsoleLoggerAdapter } from '../adapters/logger';
import { AdapterMap } from '../module';

const NativefyContext = createContext<AdapterMap | null>(null);

interface NativefyProviderProps {
  config: AdapterMap;
  children: ReactNode;
}

export const NativefyProvider: React.FC<NativefyProviderProps> = ({
  config,
  children,
}: NativefyProviderProps) => {
  const contextValue = useMemo(() => {
    return {
      ...config,
      logger: config.logger || new ConsoleLoggerAdapter(),
    };
  }, [config]);

  return <NativefyContext.Provider value={contextValue}>{children}</NativefyContext.Provider>;
};

export const useNativefy = (): AdapterMap => {
  const context = useContext(NativefyContext);

  if (!context) {
    throw new Error(
      'Nativefy Error: "useNativefy" está siendo usado fuera de <NativefyProvider>. Asegúrate de envolver tu App.tsx con el Provider.',
    );
  }

  return context;
};

export function useAdapter<T extends Port>(lookupKey: string): T {
  const config = useContext(NativefyContext);

  if (!config) {
    throw new Error('useAdapter must be used within NativefyProvider');
  }

  if (config[lookupKey]) {
    return config[lookupKey] as T;
  }
  // Si no encontramos el nombre, buscamos el PRIMER adapter que tenga esa capability.
  const foundAdapter = Object.values(config).find(adapter => adapter.capability === lookupKey);

  if (foundAdapter) {
    return foundAdapter as T;
  }

  throw new Error(`Nativefy: No se encontró ningún adapter para "${lookupKey}"`);
}
