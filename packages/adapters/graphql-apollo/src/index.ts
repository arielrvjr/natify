import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  from,
  FetchResult,
  gql,
  DocumentNode,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  GraphQLPort,
  GraphQLOptions,
  GraphQLSubscriptionOptions,
  GraphQLResult,
  NativefyError,
  NativefyErrorCode,
} from '@nativefy/core';

/**
 * Configuración para el adapter de Apollo Client
 */
export interface ApolloAdapterConfig {
  /** URL del endpoint GraphQL */
  uri: string;
  /** Headers adicionales (además del token de auth) */
  headers?: Record<string, string>;
  /** Si usar caché (default: true) */
  cacheEnabled?: boolean;
  /** Callback cuando hay error de autenticación (401) */
  onAuthError?: () => void | Promise<void>;
  /** Callback cuando hay error de red */
  onNetworkError?: (error: Error) => void;
  /** Timeout en milisegundos (default: 30000) */
  timeout?: number;
}

/**
 * Adapter de GraphQL para Nativefy Framework usando Apollo Client.
 *
 * Incluye:
 * - Queries y mutations tipadas
 * - Subscriptions
 * - Inyección automática de token de autenticación
 * - Manejo de errores
 * - Caché configurable
 *
 * @example
 * ```typescript
 * import { ApolloGraphQLAdapter } from '@nativefy-adapter/graphql-apollo';
 *
 * const graphqlAdapter = new ApolloGraphQLAdapter({
 *   uri: 'https://api.example.com/graphql',
 * });
 *
 * // En NativefyProvider
 * const config = {
 *   graphql: graphqlAdapter,
 *   // ... otros adapters
 * };
 * ```
 */
export class ApolloGraphQLAdapter implements GraphQLPort {
  readonly capability = 'graphql';

  private client: ApolloClient<any>;
  private authToken: string | null = null;
  private config: ApolloAdapterConfig;
  private authLink: ApolloLink;

  constructor(config: ApolloAdapterConfig) {
    this.config = {
      cacheEnabled: true,
      timeout: 30000,
      ...config,
    };

    // Crear link de autenticación que inyecta el token
    this.authLink = new ApolloLink((operation, forward) => {
      // Agregar token a los headers si está disponible
      if (this.authToken) {
        operation.setContext({
          headers: {
            ...operation.getContext().headers,
            authorization: `Bearer ${this.authToken}`,
          },
        });
      }

      // Agregar headers adicionales de configuración
      if (this.config.headers) {
        operation.setContext({
          headers: {
            ...operation.getContext().headers,
            ...this.config.headers,
          },
        });
      }

      return forward(operation);
    });

    // Link de manejo de errores
    const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
          console.error(
            `[GraphQL Error] Message: ${message}, Location: ${locations}, Path: ${path}`,
          );
        });
      }

      if (networkError) {
        console.error(`[Network Error] ${networkError.message}`);

        // Manejar error de autenticación
        if ('statusCode' in networkError && networkError.statusCode === 401) {
          this.config.onAuthError?.();
        }

        this.config.onNetworkError?.(networkError as Error);
      }
    });

    // Crear HTTP link
    const httpLink = createHttpLink({
      uri: this.config.uri,
    });

    // Combinar links: auth -> error -> http
    const link = from([this.authLink, errorLink, httpLink]);

    // Crear cliente Apollo
    this.client = new ApolloClient({
      link,
      cache: this.config.cacheEnabled ? new InMemoryCache() : undefined,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
        query: {
          fetchPolicy: 'cache-first',
        },
      },
    });
  }

  /**
   * Ejecuta una query GraphQL
   */
  async query<T = any>(query: string, options?: GraphQLOptions): Promise<GraphQLResult<T>> {
    try {
      const queryDocument = typeof query === 'string' ? gql(query) : (query as DocumentNode);

      const result = await this.client.query<T>({
        query: queryDocument,
        variables: options?.variables,
        context: options?.context,
        fetchPolicy: (options?.fetchPolicy || 'cache-first') as any,
        errorPolicy: options?.errorPolicy || 'none',
      });

      return {
        data: result.data,
        errors: result.errors
          ? result.errors.map(err => ({
              message: err.message,
              locations: err.locations
                ? err.locations.map(loc => ({ line: loc.line, column: loc.column }))
                : undefined,
              path: err.path ? [...err.path] : undefined,
              extensions: err.extensions as Record<string, any> | undefined,
            }))
          : undefined,
        extensions: (result as any).extensions,
      };
    } catch (error: any) {
      // Convertir errores de Apollo a NativefyError
      if (error.networkError) {
        throw new NativefyError(
          NativefyErrorCode.NETWORK_ERROR,
          error.networkError.message || 'Network error',
          error,
          { query },
        );
      }

      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const firstError = error.graphQLErrors[0];
        throw new NativefyError(
          NativefyErrorCode.VALIDATION_ERROR,
          firstError.message || 'GraphQL error',
          error,
          { query, errors: error.graphQLErrors },
        );
      }

      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        error.message || 'Unknown error occurred',
        error,
        { query },
      );
    }
  }

  /**
   * Ejecuta una mutation GraphQL
   */
  async mutate<T = any>(mutation: string, options?: GraphQLOptions): Promise<GraphQLResult<T>> {
    try {
      const mutationDocument =
        typeof mutation === 'string' ? gql(mutation) : (mutation as DocumentNode);

      const result = await this.client.mutate<T>({
        mutation: mutationDocument,
        variables: options?.variables,
        context: options?.context,
        fetchPolicy: (options?.fetchPolicy === 'cache-and-network' ? 'network-only' : options?.fetchPolicy || 'network-only') as any,
        errorPolicy: options?.errorPolicy || 'none',
      });

      return {
        data: result.data as T,
        errors: result.errors
          ? result.errors.map(err => ({
              message: err.message,
              locations: err.locations
                ? err.locations.map(loc => ({ line: loc.line, column: loc.column }))
                : undefined,
              path: err.path ? [...err.path] : undefined,
              extensions: err.extensions as Record<string, any> | undefined,
            }))
          : undefined,
        extensions: (result as any).extensions,
      };
    } catch (error: any) {
      // Convertir errores de Apollo a NativefyError
      if (error.networkError) {
        throw new NativefyError(
          NativefyErrorCode.NETWORK_ERROR,
          error.networkError.message || 'Network error',
          error,
          { mutation },
        );
      }

      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const firstError = error.graphQLErrors[0];
        throw new NativefyError(
          NativefyErrorCode.VALIDATION_ERROR,
          firstError.message || 'GraphQL error',
          error,
          { mutation, errors: error.graphQLErrors },
        );
      }

      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        error.message || 'Unknown error occurred',
        error,
        { mutation },
      );
    }
  }

  /**
   * Suscribe a una subscription GraphQL
   */
  subscribe<T = any>(
    subscription: string,
    options?: GraphQLSubscriptionOptions,
  ): {
    subscribe: (onNext: (result: GraphQLResult<T>) => void, onError?: (error: Error) => void) => {
      unsubscribe: () => void;
    };
  } {
    const subscriptionDocument =
      typeof subscription === 'string' ? gql(subscription) : (subscription as DocumentNode);

    const observable = this.client.subscribe<T>({
      query: subscriptionDocument,
      variables: options?.variables,
      fetchPolicy: 'network-only' as any, // Subscriptions always use network-only
    });

    return {
      subscribe: (
        onNext: (result: GraphQLResult<T>) => void,
        onError?: (error: Error) => void,
      ) => {
        const subscription = observable.subscribe({
          next: (result: FetchResult<T>) => {
            onNext({
              data: result.data as T,
              errors: result.errors?.map(err => ({
                message: err.message,
                locations: err.locations ? [...err.locations] : undefined,
                path: err.path ? [...err.path] : undefined,
                extensions: err.extensions ? { ...err.extensions } : undefined,
              })),
              extensions: result.extensions,
            });
          },
          error: (error: Error) => {
            onError?.(error);
          },
        });

        return {
          unsubscribe: () => {
            subscription.unsubscribe();
          },
        };
      },
    };
  }

  /**
   * Establece el token de autenticación
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    // El token se inyectará automáticamente en la próxima petición
    // gracias al authLink
  }

  /**
   * Obtiene el token de autenticación actual
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Limpia el token de autenticación
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Limpia el caché de GraphQL
   */
  async clearCache(): Promise<void> {
    await this.client.clearStore();
  }

  /**
   * Resetea el cliente GraphQL
   */
  async resetClient(): Promise<void> {
    await this.client.resetStore();
  }

  /**
   * Obtiene el cliente Apollo subyacente (para casos avanzados)
   */
  getApolloClient(): ApolloClient<any> {
    return this.client;
  }
}

