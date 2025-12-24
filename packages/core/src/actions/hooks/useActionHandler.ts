import { useEffect, useRef } from 'react';
import { actionBus } from '../ActionBus';
import { Action, ActionHandler } from '../types';

/**
 * Hook para registrar un handler de acciones.
 * El handler se desregistra automáticamente al desmontar el componente.
 *
 * @example
 * ```typescript
 * // En AuthModule
 * useActionHandler('auth:logout', async () => {
 *   await logoutUseCase.execute();
 *   navigation.reset([{ name: 'auth/Login' }]);
 * });
 * ```
 */
export function useActionHandler<A extends Action, R = void>(
  actionType: A['type'],
  handler: ActionHandler<A, R>,
  deps: React.DependencyList = [],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler: ActionHandler<A, R> = action => {
      return handlerRef.current(action);
    };

    const unsubscribe = actionBus.register(actionType, stableHandler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionType, ...deps]);
}
