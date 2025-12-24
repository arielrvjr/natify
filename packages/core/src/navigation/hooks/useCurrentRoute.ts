import { useAdapter } from '../../di/DIProvider';
import { NavigationPort } from '../../ports/NavigationPort';

/**
 * Hook para obtener la ruta actual.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const currentRoute = useCurrentRoute();
 *   console.log('Current route:', currentRoute);
 * }
 * ```
 */
export function useCurrentRoute(): string | undefined {
  const navigation = useAdapter<NavigationPort>('navigation');
  return navigation.getCurrentRoute();
}
