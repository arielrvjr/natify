import { useCallback, useEffect, useRef } from 'react';
import { actionBus } from './ActionBus';
import { Action, ActionHandler } from './types';

/**
 * Hook para despachar acciones al ActionBus
 *
 * @example
 * ```typescript
 * function LogoutButton() {
 *   const dispatch = useActionDispatch();
 *
 *   const handleLogout = async () => {
 *     await dispatch({ type: 'auth:logout' });
 *   };
 *
 *   return <Button onPress={handleLogout} title="Logout" />;
 * }
 * ```
 */
export function useActionDispatch() {
  return useCallback(<A extends Action>(action: A) => {
    return actionBus.dispatch(action);
  }, []);
}

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

/**
 * Hook para ejecutar una query y obtener el resultado
 *
 * @example
 * ```typescript
 * function UserProfile() {
 *   const query = useActionQuery();
 *
 *   const [user, setUser] = useState(null);
 *
 *   useEffect(() => {
 *     query<GetUserAction, User>({ type: 'user:get', payload: { id: '123' } })
 *       .then(setUser);
 *   }, []);
 * }
 * ```
 */
export function useActionQuery() {
  return useCallback(<A extends Action, R>(action: A) => {
    return actionBus.query<A, R>(action);
  }, []);
}
