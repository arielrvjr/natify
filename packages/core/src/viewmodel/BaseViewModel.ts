import { useState, useCallback, useRef, useEffect } from 'react';
import { NativefyError, NativefyErrorCode } from '../errors';

/**
 * Estado base de un ViewModel
 */
export interface BaseViewModelState {
  /**
   * Indica si hay una operación en progreso
   */
  isLoading: boolean;

  /**
   * Error de la última operación (null si no hay error)
   */
  error: NativefyError | null;
}

/**
 * Acciones base de un ViewModel
 */
export interface BaseViewModelActions {
  /**
   * Establece el estado de carga
   */
  setLoading: (loading: boolean) => void;

  /**
   * Establece un error
   */
  setError: (error: NativefyError | null) => void;

  /**
   * Limpia el error actual
   */
  clearError: () => void;

  /**
   * Ejecuta una función async manejando loading y error automáticamente
   * @returns El resultado de la función o undefined si hubo error
   */
  execute: <T>(fn: () => Promise<T>) => Promise<T | undefined>;

  /**
   * Ejecuta una función async y lanza el error si falla
   * @returns El resultado de la función
   * @throws NativefyError si la operación falla
   */
  executeOrThrow: <T>(fn: () => Promise<T>) => Promise<T>;
}

/**
 * Hook base para ViewModels
 *
 * Provee estado común (loading, error) y helpers para ejecutar
 * operaciones async de forma segura.
 *
 * @example
 * ```typescript
 * function useLoginViewModel() {
 *   const [baseState, baseActions] = useBaseViewModel();
 *   const [email, setEmail] = useState('');
 *
 *   const login = async () => {
 *     await baseActions.execute(async () => {
 *       await loginUseCase.execute({ email });
 *     });
 *   };
 *
 *   return {
 *     state: { ...baseState, email },
 *     actions: { setEmail, login },
 *   };
 * }
 * ```
 */
export function useBaseViewModel(): [BaseViewModelState, BaseViewModelActions] {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<NativefyError | null>(null);

  // Ref para evitar updates en componentes desmontados
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    if (isMounted.current) {
      setIsLoading(loading);
    }
  }, []);

  const setErrorSafe = useCallback((err: NativefyError | null) => {
    if (isMounted.current) {
      setError(err);
    }
  }, []);

  const clearError = useCallback(() => {
    if (isMounted.current) {
      setError(null);
    }
  }, []);

  /**
   * Ejecuta una función async manejando loading y error automáticamente.
   * Retorna undefined si hay error (no lanza excepción).
   */
  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (isMounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const result = await fn();
      if (isMounted.current) {
        setIsLoading(false);
      }
      return result;
    } catch (err) {
      if (isMounted.current) {
        setIsLoading(false);
        const nativefyError =
          err instanceof NativefyError
            ? err
            : new NativefyError(
                NativefyErrorCode.UNKNOWN,
                (err as Error).message || 'Unknown error',
                err,
              );
        setError(nativefyError);
      }
      return undefined;
    }
  }, []);

  /**
   * Ejecuta una función async y lanza el error si falla.
   * Útil cuando necesitas manejar el error de forma específica.
   */
  const executeOrThrow = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    if (isMounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const result = await fn();
      if (isMounted.current) {
        setIsLoading(false);
      }
      return result;
    } catch (err) {
      if (isMounted.current) {
        setIsLoading(false);
        const nativefyError =
          err instanceof NativefyError
            ? err
            : new NativefyError(
                NativefyErrorCode.UNKNOWN,
                (err as Error).message || 'Unknown error',
                err,
              );
        setError(nativefyError);
      }
      throw err;
    }
  }, []);

  const state: BaseViewModelState = { isLoading, error };
  const actions: BaseViewModelActions = {
    setLoading,
    setError: setErrorSafe,
    clearError,
    execute,
    executeOrThrow,
  };

  return [state, actions];
}
