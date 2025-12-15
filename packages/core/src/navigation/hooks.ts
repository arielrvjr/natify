import { useCallback } from 'react';
import { useAdapter } from '../context/NativefyProvider';
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

/**
 * Hook para navegación simplificada.
 * Provee métodos de navegación sin necesidad de importar el adapter.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { navigate, goBack, reset } = useAppNavigation();
 *
 *   const handlePress = () => {
 *     navigate('products/ProductDetail', { productId: '123' });
 *   };
 * }
 * ```
 */
export function useAppNavigation() {
  const navigation = useAdapter<NavigationPort>('navigation');

  const navigate = useCallback(
    <T extends NavigationParams>(
      routeName: string,
      params?: T,
      options?: { replace?: boolean },
    ) => {
      navigation.navigate(routeName, params, options);
    },
    [navigation],
  );

  const goBack = useCallback(() => {
    return navigation.goBack();
  }, [navigation]);

  const reset = useCallback(
    (routes: Array<{ name: string; params?: NavigationParams }>) => {
      navigation.reset(routes);
    },
    [navigation],
  );

  const replace = useCallback(
    <T extends NavigationParams>(routeName: string, params?: T) => {
      navigation.replace(routeName, params);
    },
    [navigation],
  );

  const canGoBack = useCallback(() => {
    return navigation.canGoBack();
  }, [navigation]);

  return {
    navigate,
    goBack,
    reset,
    replace,
    canGoBack,
    getCurrentRoute: navigation.getCurrentRoute.bind(navigation),
    getCurrentParams: navigation.getCurrentParams.bind(navigation),
  };
}
