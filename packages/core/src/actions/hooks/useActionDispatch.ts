import { useCallback } from 'react';
import { actionBus } from '../ActionBus';
import { Action } from '../types';

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
