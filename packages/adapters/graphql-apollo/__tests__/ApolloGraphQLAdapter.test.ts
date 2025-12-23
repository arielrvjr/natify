import { ApolloGraphQLAdapter } from '../src';
import { NativefyError, NativefyErrorCode } from '@nativefy/core';
import { ApolloClient, gql } from '@apollo/client';

// Mock Apollo Client
const mockQuery = jest.fn();
const mockMutate = jest.fn();
const mockSubscribe = jest.fn();
const mockClearStore = jest.fn();
const mockResetStore = jest.fn();

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
    createHttpLink: jest.fn(),
    ApolloLink: jest.fn().mockImplementation((handler) => handler),
    from: jest.fn((links) => links[links.length - 1]),
  };
});

jest.mock('@apollo/client/link/error', () => ({
  onError: jest.fn((handler) => handler),
}));

describe('ApolloGraphQLAdapter', () => {
  let adapter: ApolloGraphQLAdapter;
  const mockUri = 'https://api.example.com/graphql';

  beforeEach(() => {
    jest.clearAllMocks();
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

    it('should throw NativefyError on network error', async () => {
      const networkError = {
        networkError: {
          message: 'Network error',
        },
      };
      mockQuery.mockRejectedValue(networkError);

      const query = 'query { users { id } }';

      await expect(adapter.query(query)).rejects.toThrow(NativefyError);
      await expect(adapter.query(query)).rejects.toThrow('Network error');
    });

    it('should throw NativefyError on GraphQL error', async () => {
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

      await expect(adapter.query(query)).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError on network error', async () => {
      const networkError = {
        networkError: {
          message: 'Network error',
        },
      };
      mockMutate.mockRejectedValue(networkError);

      const mutation = 'mutation { createUser { id } }';

      await expect(adapter.mutate(mutation)).rejects.toThrow(NativefyError);
    });

    it('should throw NativefyError on GraphQL error', async () => {
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

      await expect(adapter.mutate(mutation)).rejects.toThrow(NativefyError);
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
});

