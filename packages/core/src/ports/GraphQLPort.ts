import { Port } from './Port';

/**
 * Opciones para ejecutar una query o mutation
 */
export interface GraphQLOptions {
  /** Variables de la query/mutation */
  variables?: Record<string, any>;
  /** Contexto adicional (headers, etc.) */
  context?: Record<string, any>;
  /** Si usar caché (default: true) */
  fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only' | 'no-cache';
  /** Si mostrar errores de red (default: true) */
  errorPolicy?: 'none' | 'ignore' | 'all';
}

/**
 * Opciones para suscripciones
 */
export interface GraphQLSubscriptionOptions {
  /** Variables de la subscription */
  variables?: Record<string, any>;
  /** Si usar caché */
  fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only' | 'no-cache';
}

/**
 * Resultado de una query o mutation
 */
export interface GraphQLResult<T> {
  /** Datos de la respuesta */
  data: T;
  /** Errores de GraphQL (si los hay) */
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
  /** Extensiones de la respuesta */
  extensions?: Record<string, any>;
}

/**
 * Puerto para operaciones GraphQL.
 * Incluye queries, mutations, subscriptions y manejo de autenticación.
 */
export interface GraphQLPort extends Port {
  readonly capability: 'graphql';

  /**
   * Ejecuta una query de lectura.
   * @param query String de la query GraphQL o documento
   * @param options Opciones de ejecución
   * @returns Resultado tipado
   */
  query<T = any>(query: string, options?: GraphQLOptions): Promise<GraphQLResult<T>>;

  /**
   * Ejecuta una mutation.
   * @param mutation String de la mutation GraphQL o documento
   * @param options Opciones de ejecución
   * @returns Resultado tipado
   */
  mutate<T = any>(mutation: string, options?: GraphQLOptions): Promise<GraphQLResult<T>>;

  /**
   * Suscribe a una subscription GraphQL.
   * @param subscription String de la subscription GraphQL o documento
   * @param options Opciones de suscripción
   * @returns Observable que emite los resultados
   */
  subscribe<T = any>(
    subscription: string,
    options?: GraphQLSubscriptionOptions,
  ): {
    subscribe: (
      onNext: (result: GraphQLResult<T>) => void,
      onError?: (error: Error) => void,
    ) => {
      unsubscribe: () => void;
    };
  };

  /**
   * Establece el token de autenticación.
   * Se inyectará automáticamente en todas las peticiones.
   * @param token Token de autenticación (Bearer token)
   */
  setAuthToken(token: string | null): void;

  /**
   * Obtiene el token de autenticación actual.
   * @returns Token actual o null
   */
  getAuthToken(): string | null;

  /**
   * Limpia el token de autenticación.
   */
  clearAuthToken(): void;

  /**
   * Limpia el caché de GraphQL.
   * Útil después de logout o cuando se necesita refrescar datos.
   */
  clearCache(): Promise<void>;

  /**
   * Resetea el cliente GraphQL.
   * Útil para reconectar después de cambios de configuración.
   */
  resetClient(): Promise<void>;
}
