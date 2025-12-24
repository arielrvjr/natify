import { useState, useCallback } from 'react';
import { AdapterMap } from '../../types/adapters';
import { RegisteredModule } from '../../module/types';

/**
 * Estado interno de NatifyApp
 */
export interface NatifyAppState {
  isReady: boolean;
  error: Error | null;
}

/**
 * Handlers para NatifyApp
 */
export interface NatifyAppHandlers {
  handleModulesLoaded: (loadedModules: RegisteredModule[]) => void;
  handleError: (err: Error) => void;
  handleRetry: () => void;
}

/**
 * Hook que maneja el estado y handlers de NatifyApp
 *
 * @param onReady - Callback cuando los módulos están cargados
 * @param onError - Callback en caso de error
 * @returns Estado y handlers
 */
export function useNatifyAppHandlers(
  onReady?: (modules: RegisteredModule[], adapters: AdapterMap) => void,
  onError?: (error: Error) => void,
  adapters?: AdapterMap,
): [NatifyAppState, NatifyAppHandlers] {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleModulesLoaded = useCallback(
    (loadedModules: RegisteredModule[]) => {
      setIsReady(true);
      if (adapters) {
        onReady?.(loadedModules, adapters);
      }
    },
    [onReady, adapters],
  );

  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      onError?.(err);
    },
    [onError],
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setIsReady(false);
  }, []);

  return [
    { isReady, error },
    { handleModulesLoaded, handleError, handleRetry },
  ];
}
