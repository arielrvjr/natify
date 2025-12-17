import { useAdapter } from '../di/DIProvider';
import { NavigationPort, NavigationParams } from '../ports/NavigationPort';

/**
 * Hook para obtener los parámetros de navegación de la pantalla actual.
 * Abstrae la dependencia directa de React Navigation.
 *
 * @example
 * ```typescript
 * interface ProductDetailParams {
 *   productId: string;
 *   title?: string;
 * }
 *
 * function ProductDetailScreen() {
 *   const params = useNavigationParams<ProductDetailParams>();
 *   // params.productId es string
 *   // params.title es string | undefined
 * }
 * ```
 */
export function useNavigationParams<T extends NavigationParams>(): T {
  const navigation = useAdapter<NavigationPort>('navigation');
  return (navigation.getCurrentParams<T>() ?? {}) as T;
}

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
