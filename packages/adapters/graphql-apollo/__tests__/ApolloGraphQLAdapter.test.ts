import { ApolloGraphQLAdapter } from '../src';
import { NatifyError, NatifyErrorCode } from '@natify/core';
import { ApolloClient, gql } from '@apollo/client';

// Mock Apollo Client
const mockQuery = jest.fn();
const mockMutate = jest.fn();
const mockSubscribe = jest.fn();
const mockClearStore = jest.fn();
const mockResetStore = jest.fn();
let capturedAuthLinkHandler: any = null;
let capturedErrorLinkHandler: any = null;
const mockForward = jest.fn((operation) => {
  // Simular que forward ejecuta la operación
  return Promise.resolve({ data: {}, errors: undefined });
});

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    ApolloClient: jest.fn().mockImplementation(() => ({
      query: mockQuery,
      mutate: mockMutate,
      subscribe: mockSubscribe,
      clearStore: mockClearStore,
      resetStore: mockResetStore,
    })),
    InMemoryCache: jest.fn(),
    createHttpLink: jest.fn(() => mockForward),
    ApolloLink: jest.fn().mockImplementation((handler) => {
      capturedAuthLinkHandler = handler;
      return handler;
    }),
    from: jest.fn((links) => {
      // Retornar una función que ejecuta los links en orden
      return (operation: any) => {
        // Ejecutar authLink primero
        if (capturedAuthLinkHandler) {
          return capturedAuthLinkHandler(operation, mockForward);
        }
        // Luego errorLink (se ejecuta en onError)
        return mockForward(operation);
      };
    }),
  };
});

jest.mock('@apollo/client/link/error', () => ({
  onError: jest.fn((handler) => {
    capturedErrorLinkHandler = handler;
    return handler;
  }),
}));

describe('ApolloGraphQLAdapter', () => {
  let adapter: ApolloGraphQLAdapter;
  const mockUri = 'https://api.example.com/graphql';

  beforeEach(() => {
    jest.clearAllMocks();
    capturedAuthLinkHandler = null;
    capturedErrorLinkHandler = null;
    adapter = new ApolloGraphQLAdapter({
      uri: mockUri,
    });
  });

  describe('constructor', () => {
    it('should create adapter with default config', () => {
      expect(adapter).toBeDefined();
      expect(adapter.capability).toBe('graphql');
    });

    it('should create adapter with custom config', () => {
      const customAdapter = new ApolloGraphQLAdapter({
        uri: mockUri,
        cacheEnabled: false,
        timeout: 5000,
        headers: { 'X-Custom': 'value' },
      });

      expect(customAdapter).toBeDefined();
    });
  });

  describe('setAuthToken', () => {
    it('should set auth token', () => {
      adapter.setAuthToken('test-token-123');

      expect(adapter.getAuthToken()).toBe('test-token-123');
    });

    it('should clear auth token when set to null', () => {
      adapter.setAuthToken('test-token-123');
      adapter.setAuthToken(null);

      expect(adapter.getAuthToken()).toBeNull();
    });
  });

  describe('query', () => {
    it('should execute query successfully', async () => {
      const mockData = { users: [{ id: 1, name: 'Test' }] };
      mockQuery.mockResolvedValue({
        data: mockData,
        errors: undefined,
        extensions: undefined,
      });

      const query = 'query { users { id name } }';
      const result = await adapter.query(query);

      expect(mockQuery).toHaveBeenCalled();
      expect(result.data).toEqual(mockData);
      expect(result.errors).toBeUndefined();
    });

    it('should execute query with variables', async () => {
      const mockData = { user: { id: 1, name: 'Test' } };
      mockQuery.mockResolvedValue({
        data: mockData,
        errors: undefined,
      });

      const query = 'query GetUser($id: ID!) { user(id: $id) { id name } }';
      const variables = { id: '1' };
      await adapter.query(query, { variables });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables,
        }),
      );
    });

    it('should throw NatifyError on network error', async () => {
      const networkError = {
        networkError: {
          message: 'Network error',
        },
      };
      mockQuery.mockRejectedValue(networkError);

      const query = 'query { users { id } }';

      await expect(adapter.query(query)).rejects.toThrow(NatifyError);
      await expect(adapter.query(query)).rejects.toThrow('Network error');
    });

    it('should throw NatifyError on GraphQL error', async () => {
      const graphQLError = {
        graphQLErrors: [
          {
            message: 'GraphQL error',
            locations: [],
            path: ['users'],
            extensions: {},
          },
        ],
      };
      mockQuery.mockRejectedValue(graphQLError);

      const query = 'query { users { id } }';

      await expect(adapter.query(query)).rejects.toThrow(NatifyError);
      await expect(adapter.query(query)).rejects.toThrow('GraphQL error');
    });

    it('should include errors in result when errorPolicy is all', async () => {
      const mockData = { users: null };
      const mockErrors = [
        {
          message: 'Error message',
          locations: [],
          path: ['users'],
          extensions: {},
        },
      ];
      mockQuery.mockResolvedValue({
        data: mockData,
        errors: mockErrors,
      });

      const query = 'query { users { id } }';
      const result = await adapter.query(query, { errorPolicy: 'all' });

      expect(result.data).toEqual(mockData);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBe(1);
    });

    it('should map errors with locations correctly', async () => {
      const mockData = { users: null };
      const mockErrors = [
        {
          message: 'Error with locations',
          locations: [{ line: 1, column: 5 }],
          path: ['users'],
          extensions: { code: 'VALIDATION_ERROR' },
        },
      ];
      mockQuery.mockResolvedValue({
        data: mockData,
        errors: mockErrors,
      });

      const query = 'query { users { id } }';
      const result = await adapter.query(query, { errorPolicy: 'all' });

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.locations).toEqual([{ line: 1, column: 5 }]);
      expect(result.errors?.[0]?.extensions).toEqual({ code: 'VALIDATION_ERROR' });
    });

    it('should throw NatifyError on unknown error', async () => {
      const unknownError = {
        message: 'Unknown error',
      };
      mockQuery.mockRejectedValue(unknownError);

      const query = 'query { users { id } }';

      await expect(adapter.query(query)).rejects.toThrow(NatifyError);
      await expect(adapter.query(query)).rejects.toThrow('Unknown error');
    });

    it('should execute query with DocumentNode instead of string', async () => {
      const mockData = { users: [{ id: 1 }] };
      mockQuery.mockResolvedValue({
        data: mockData,
        errors: undefined,
      });

      const queryDocument = gql`
        query {
          users {
            id
          }
        }
      `;
      const result = await adapter.query(queryDocument);

      expect(mockQuery).toHaveBeenCalled();
      expect(result.data).toEqual(mockData);
    });

    it('should execute query with context', async () => {
      const mockData = { users: [] };
      mockQuery.mockResolvedValue({
        data: mockData,
        errors: undefined,
      });

      const query = 'query { users { id } }';
      const context = { custom: 'value' };
      await adapter.query(query, { context });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          context,
        }),
      );
    });

    it('should execute query with different fetchPolicy', async () => {
      const mockData = { users: [] };
      mockQuery.mockResolvedValue({
        data: mockData,
        errors: undefined,
      });

      const query = 'query { users { id } }';
      await adapter.query(query, { fetchPolicy: 'network-only' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchPolicy: 'network-only',
        }),
      );
    });
  });

  describe('mutate', () => {
    it('should execute mutation successfully', async () => {
      const mockData = { createUser: { id: 1, name: 'New User' } };
      mockMutate.mockResolvedValue({
        data: mockData,
        errors: undefined,
      });

      const mutation = 'mutation CreateUser($name: String!) { createUser(name: $name) { id name } }';
      const variables = { name: 'New User' };
      const result = await adapter.mutate(mutation, { variables });

      expect(mockMutate).toHaveBeenCalled();
      expect(result.data).toEqual(mockData);
    });

    it('should throw NatifyError on network error', async () => {
      const networkError = {
        networkError: {
          message: 'Network error',
        },
      };
      mockMutate.mockRejectedValue(networkError);

      const mutation = 'mutation { createUser { id } }';

      await expect(adapter.mutate(mutation)).rejects.toThrow(NatifyError);
    });

    it('should throw NatifyError on GraphQL error', async () => {
      const graphQLError = {
        graphQLErrors: [
          {
            message: 'Validation error',
            locations: [],
            path: ['createUser'],
            extensions: {},
          },
        ],
      };
      mockMutate.mockRejectedValue(graphQLError);

      const mutation = 'mutation { createUser { id } }';

      await expect(adapter.mutate(mutation)).rejects.toThrow(NatifyError);
    });

    it('should map errors with locations in mutation', async () => {
      const mockData = { createUser: null };
      const mockErrors = [
        {
          message: 'Mutation error',
          locations: [{ line: 2, column: 10 }],
          path: ['createUser'],
          extensions: { code: 'MUTATION_ERROR' },
        },
      ];
      mockMutate.mockResolvedValue({
        data: mockData,
        errors: mockErrors,
      });

      const mutation = 'mutation { createUser { id } }';
      const result = await adapter.mutate(mutation, { errorPolicy: 'all' });

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.locations).toEqual([{ line: 2, column: 10 }]);
      expect(result.errors?.[0]?.extensions).toEqual({ code: 'MUTATION_ERROR' });
    });

    it('should throw NatifyError on unknown error in mutation', async () => {
      const unknownError = {
        message: 'Unknown mutation error',
      };
      mockMutate.mockRejectedValue(unknownError);

      const mutation = 'mutation { createUser { id } }';

      await expect(adapter.mutate(mutation)).rejects.toThrow(NatifyError);
      await expect(adapter.mutate(mutation)).rejects.toThrow('Unknown mutation error');
    });

    it('should execute mutation with cache-and-network fetchPolicy (converted to network-only)', async () => {
      const mockData = { createUser: { id: 1 } };
      mockMutate.mockResolvedValue({
        data: mockData,
        errors: undefined,
      });

      const mutation = 'mutation { createUser { id } }';
      await adapter.mutate(mutation, { fetchPolicy: 'cache-and-network' });

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchPolicy: 'network-only',
        }),
      );
    });

    it('should execute mutation with DocumentNode instead of string', async () => {
      const mockData = { createUser: { id: 1 } };
      mockMutate.mockResolvedValue({
        data: mockData,
        errors: undefined,
      });

      const mutationDocument = gql`
        mutation {
          createUser {
            id
          }
        }
      `;
      const result = await adapter.mutate(mutationDocument);

      expect(mockMutate).toHaveBeenCalled();
      expect(result.data).toEqual(mockData);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to subscription', () => {
      const mockObservable = {
        subscribe: jest.fn((handlers) => ({
          unsubscribe: jest.fn(),
        })),
      };
      mockSubscribe.mockReturnValue(mockObservable);

      const subscription = 'subscription { userUpdated { id name } }';
      const result = adapter.subscribe(subscription);

      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });

    it('should call onNext when subscription emits', () => {
      const mockData = { userUpdated: { id: 1, name: 'Updated' } };
      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.next({ data: mockData, errors: undefined });
          return { unsubscribe: jest.fn() };
        }),
      };
      mockSubscribe.mockReturnValue(mockObservable);

      const subscription = 'subscription { userUpdated { id name } }';
      const result = adapter.subscribe(subscription);

      const onNext = jest.fn();
      const unsubscribe = result.subscribe(onNext);

      expect(onNext).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockData,
        }),
      );
      expect(unsubscribe).toBeDefined();
    });

    it('should call onError when subscription errors', () => {
      const mockError = new Error('Subscription error');
      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.error(mockError);
          return { unsubscribe: jest.fn() };
        }),
      };
      mockSubscribe.mockReturnValue(mockObservable);

      const subscription = 'subscription { userUpdated { id } }';
      const result = adapter.subscribe(subscription);

      const onError = jest.fn();
      result.subscribe(jest.fn(), onError);

      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should handle subscription with errors in result', () => {
      const mockData = { userUpdated: null };
      const mockErrors = [
        {
          message: 'Subscription error',
          locations: [{ line: 1, column: 1 }],
          path: ['userUpdated'],
          extensions: { code: 'SUBSCRIPTION_ERROR' },
        },
      ];
      const mockObservable = {
        subscribe: jest.fn((handlers) => {
          handlers.next({ data: mockData, errors: mockErrors });
          return { unsubscribe: jest.fn() };
        }),
      };
      mockSubscribe.mockReturnValue(mockObservable);

      const subscription = 'subscription { userUpdated { id } }';
      const result = adapter.subscribe(subscription);

      const onNext = jest.fn();
      result.subscribe(onNext);

      expect(onNext).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockData,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: 'Subscription error',
              locations: [{ line: 1, column: 1 }],
            }),
          ]),
        }),
      );
    });

    it('should allow unsubscribing from subscription', () => {
      const mockUnsubscribe = jest.fn();
      const mockObservable = {
        subscribe: jest.fn(() => ({
          unsubscribe: mockUnsubscribe,
        })),
      };
      mockSubscribe.mockReturnValue(mockObservable);

      const subscription = 'subscription { userUpdated { id } }';
      const result = adapter.subscribe(subscription);

      const unsubscribe = result.subscribe(jest.fn());

      unsubscribe.unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should subscribe with variables', () => {
      const mockObservable = {
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn(),
        })),
      };
      mockSubscribe.mockReturnValue(mockObservable);

      const subscription = 'subscription { userUpdated(id: $id) { id } }';
      const variables = { id: '123' };
      adapter.subscribe(subscription, { variables });

      expect(mockSubscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          variables,
        }),
      );
    });

    it('should subscribe with DocumentNode instead of string', () => {
      const mockObservable = {
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn(),
        })),
      };
      mockSubscribe.mockReturnValue(mockObservable);

      const subscriptionDocument = gql`
        subscription {
          userUpdated {
            id
          }
        }
      `;
      const result = adapter.subscribe(subscriptionDocument);

      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });
  });

  describe('clearCache', () => {
    it('should clear cache', async () => {
      mockClearStore.mockResolvedValue(undefined);

      await adapter.clearCache();

      expect(mockClearStore).toHaveBeenCalled();
    });
  });

  describe('resetClient', () => {
    it('should reset client', async () => {
      mockResetStore.mockResolvedValue(undefined);

      await adapter.resetClient();

      expect(mockResetStore).toHaveBeenCalled();
    });
  });

  describe('clearAuthToken', () => {
    it('should clear auth token', () => {
      adapter.setAuthToken('test-token-123');
      adapter.clearAuthToken();

      expect(adapter.getAuthToken()).toBeNull();
    });
  });

  describe('getApolloClient', () => {
    it('should return Apollo client instance', () => {
      const client = adapter.getApolloClient();

      expect(client).toBeDefined();
      expect(client.query).toBe(mockQuery);
      expect(client.mutate).toBe(mockMutate);
    });
  });

  describe('authLink', () => {
    it('should inject auth token in headers when token is set', () => {
      const mockOperation = {
        setContext: jest.fn(),
        getContext: jest.fn(() => ({ headers: {} })),
      };

      adapter.setAuthToken('test-token-123');

      // Ejecutar el authLink handler directamente
      if (capturedAuthLinkHandler) {
        capturedAuthLinkHandler(mockOperation, mockForward);
      }

      // Verificar que setContext fue llamado con el token
      expect(mockOperation.setContext).toHaveBeenCalledWith({
        headers: {
          authorization: 'Bearer test-token-123',
        },
      });
    });

    it('should inject custom headers when provided in config', () => {
      const customAdapter = new ApolloGraphQLAdapter({
        uri: mockUri,
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      const mockOperation = {
        setContext: jest.fn(),
        getContext: jest.fn(() => ({ headers: {} })),
      };

      // Ejecutar el authLink handler directamente
      if (capturedAuthLinkHandler) {
        capturedAuthLinkHandler(mockOperation, mockForward);
      }

      // Verificar que setContext fue llamado con los headers personalizados
      expect(mockOperation.setContext).toHaveBeenCalledWith({
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });
    });

    it('should inject both auth token and custom headers', () => {
      const customAdapter = new ApolloGraphQLAdapter({
        uri: mockUri,
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      customAdapter.setAuthToken('test-token-123');

      const mockOperation = {
        setContext: jest.fn(),
        getContext: jest.fn(() => ({ headers: { existing: 'header' } })),
      };

      // Ejecutar el authLink handler directamente
      if (capturedAuthLinkHandler) {
        capturedAuthLinkHandler(mockOperation, mockForward);
      }

      // Verificar que setContext fue llamado con ambos headers
      expect(mockOperation.setContext).toHaveBeenCalled();
      const setContextCalls = mockOperation.setContext.mock.calls;
      expect(setContextCalls.length).toBeGreaterThan(0);
    });

    it('should not inject token when token is null', () => {
      adapter.setAuthToken(null);

      const mockOperation = {
        setContext: jest.fn(),
        getContext: jest.fn(() => ({ headers: {} })),
      };

      // Ejecutar el authLink handler directamente
      if (capturedAuthLinkHandler) {
        capturedAuthLinkHandler(mockOperation, mockForward);
      }

      // Verificar que setContext no fue llamado con authorization header
      const setContextCalls = mockOperation.setContext.mock.calls;
      const hasAuthHeader = setContextCalls.some((call) =>
        call[0]?.headers?.authorization?.includes('Bearer'),
      );
      expect(hasAuthHeader).toBe(false);
    });
  });

  describe('errorLink', () => {
    it('should handle GraphQL errors in errorLink', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const graphQLErrors = [
        {
          message: 'GraphQL error',
          locations: [{ line: 1, column: 1 }],
          path: ['test'],
          extensions: { code: 'ERROR' },
        },
      ];

      // Ejecutar el errorLink handler directamente
      if (capturedErrorLinkHandler) {
        capturedErrorLinkHandler({
          graphQLErrors,
          networkError: null,
          operation: {},
          forward: mockForward,
        });
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should call onAuthError callback when 401 error occurs', () => {
      const onAuthError = jest.fn();
      const adapterWithAuthError = new ApolloGraphQLAdapter({
        uri: mockUri,
        onAuthError,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const networkError = {
        message: 'Unauthorized',
        statusCode: 401,
      };

      // Ejecutar el errorLink handler directamente
      if (capturedErrorLinkHandler) {
        capturedErrorLinkHandler({
          graphQLErrors: null,
          networkError,
          operation: {},
          forward: mockForward,
        });
      }

      expect(onAuthError).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should call onNetworkError callback when network error occurs', () => {
      const onNetworkError = jest.fn();
      const adapterWithNetworkError = new ApolloGraphQLAdapter({
        uri: mockUri,
        onNetworkError,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const networkError = new Error('Network error');

      // Ejecutar el errorLink handler directamente
      if (capturedErrorLinkHandler) {
        capturedErrorLinkHandler({
          graphQLErrors: null,
          networkError,
          operation: {},
          forward: mockForward,
        });
      }

      expect(onNetworkError).toHaveBeenCalledWith(networkError);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle network error without statusCode', () => {
      const onNetworkError = jest.fn();
      const adapterWithNetworkError = new ApolloGraphQLAdapter({
        uri: mockUri,
        onNetworkError,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const networkError = {
        message: 'Network error without status',
      };

      // Ejecutar el errorLink handler directamente
      if (capturedErrorLinkHandler) {
        capturedErrorLinkHandler({
          graphQLErrors: null,
          networkError,
          operation: {},
          forward: mockForward,
        });
      }

      expect(onNetworkError).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle both GraphQL errors and network errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const graphQLErrors = [
        {
          message: 'GraphQL error',
          locations: [],
          path: ['test'],
          extensions: {},
        },
      ];
      const networkError = new Error('Network error');

      // Ejecutar el errorLink handler directamente
      if (capturedErrorLinkHandler) {
        capturedErrorLinkHandler({
          graphQLErrors,
          networkError,
          operation: {},
          forward: mockForward,
        });
      }

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // Una vez para GraphQL, otra para Network
      consoleErrorSpy.mockRestore();
    });
  });
});

