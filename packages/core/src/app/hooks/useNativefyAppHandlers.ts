import { useState, useCallback } from 'react';
import { AdapterMap } from '../../types/adapters';
import { RegisteredModule } from '../../module/types';

/**
 * Estado interno de NativefyApp
 */
export interface NativefyAppState {
  isReady: boolean;
  error: Error | null;
}

/**
 * Handlers para NativefyApp
 */
export interface NativefyAppHandlers {
  handleModulesLoaded: (loadedModules: RegisteredModule[]) => void;
  handleError: (err: Error) => void;
  handleRetry: () => void;
}

/**
 * Hook que maneja el estado y handlers de NativefyApp
 *
 * @param onReady - Callback cuando los módulos están cargados
 * @param onError - Callback en caso de error
 * @returns Estado y handlers
 */
export function useNativefyAppHandlers(
  onReady?: (modules: RegisteredModule[], adapters: AdapterMap) => void,
  onError?: (error: Error) => void,
  adapters?: AdapterMap,
): [NativefyAppState, NativefyAppHandlers] {
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
