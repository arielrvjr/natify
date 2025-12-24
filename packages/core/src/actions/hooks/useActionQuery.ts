import { useCallback } from 'react';
import { actionBus } from '../ActionBus';
import { Action } from '../types';

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
