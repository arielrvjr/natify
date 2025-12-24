# @natify/graphql-apollo

GraphQL adapter for Natify Framework using `@apollo/client`.

## Installation

```bash
pnpm add @natify/graphql-apollo @apollo/client graphql
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No additional configuration required.

## Usage

### Basic Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { ApolloGraphQLAdapter } from "@natify/graphql-apollo";

const graphqlAdapter = new ApolloGraphQLAdapter({
  uri: "https://api.example.com/graphql",
});

const config = {
  graphql: graphqlAdapter,
  // ... other adapters
};

function App() {
  return (
    <NatifyProvider config={config}>
      <MyApp />
    </NatifyProvider>
  );
}
```

### Advanced Configuration

```typescript
const graphqlAdapter = new ApolloGraphQLAdapter({
  uri: "https://api.example.com/graphql",
  headers: {
    "X-App-Version": "1.0.0",
    "X-Platform": "mobile",
  },
  cacheEnabled: true,
  timeout: 30000,
  onAuthError: async () => {
    // Redirect to login when there's a 401 error
    await logout();
    navigation.reset([{ name: "auth/Login" }]);
  },
  onNetworkError: (error) => {
    console.error("Network error:", error);
    // Show error notification
  },
});
```

## Authentication with Token

### Set Token After Login

```typescript
import { useAdapter, GraphQLPort, StoragePort } from "@natify/core";

function useAuth() {
  const graphql = useAdapter<GraphQLPort>("graphql");
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  const login = async (email: string, password: string) => {
    // Login using HTTP (or GraphQL mutation)
    const response = await http.post("/auth/login", { email, password });

    // Save token
    const token = response.data.token;
    await secureStorage.setItem("auth_token", token);

    // Inject token into GraphQL
    graphql.setAuthToken(token);
  };

  const logout = async () => {
    // Clear token
    graphql.clearAuthToken();
    await secureStorage.removeItem("auth_token");
    
    // Clear cache
    await graphql.clearCache();
  };

  return { login, logout };
}
```

### Restore Token on App Start

```typescript
import { useEffect } from "react";
import { useAdapter, GraphQLPort, StoragePort } from "@natify/core";

function AppInitializer() {
  const graphql = useAdapter<GraphQLPort>("graphql");
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  useEffect(() => {
    const restoreAuth = async () => {
      const token = await secureStorage.getItem<string>("auth_token");
      if (token) {
        graphql.setAuthToken(token);
      }
    };

    restoreAuth();
  }, []);

  return null;
}
```

## Queries

### Simple Query

```typescript
import { useAdapter, GraphQLPort } from "@natify/core";

const GET_USERS = `
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

function UserList() {
  const graphql = useAdapter<GraphQLPort>("graphql");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const result = await graphql.query<{ users: User[] }>(GET_USERS);
      setUsers(result.data.users);
    };

    loadUsers();
  }, []);

  return (
    <View>
      {users.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </View>
  );
}
```

### Query with Variables

```typescript
const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

const loadUser = async (userId: string) => {
  const result = await graphql.query<{ user: User }>(GET_USER, {
    variables: { id: userId },
  });

  return result.data.user;
};
```

### Query with Cache Options

```typescript
// Always get fresh data from server
const result = await graphql.query(GET_USERS, {
  fetchPolicy: "network-only",
});

// Use cache if available, otherwise make request
const result = await graphql.query(GET_USERS, {
  fetchPolicy: "cache-and-network",
});

// Only use cache (don't make request)
const result = await graphql.query(GET_USERS, {
  fetchPolicy: "cache-only",
});
```

## Mutations

### Simple Mutation

```typescript
const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

const createUser = async (name: string, email: string) => {
  const result = await graphql.mutate<{ createUser: User }>(CREATE_USER, {
    variables: {
      input: { name, email },
    },
  });

  return result.data.createUser;
};
```

### Mutation with Error Handling

```typescript
const UPDATE_PROFILE = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
    }
  }
`;

const updateProfile = async (input: UpdateProfileInput) => {
  try {
    const result = await graphql.mutate<{ updateProfile: User }>(UPDATE_PROFILE, {
      variables: { input },
      errorPolicy: "all", // Return data even if there are errors
    });

    if (result.errors && result.errors.length > 0) {
      // Handle GraphQL errors
      result.errors.forEach(error => {
        console.error("GraphQL Error:", error.message);
      });
    }

    return result.data.updateProfile;
  } catch (error) {
    if (error instanceof NatifyError) {
      // Handle network or validation errors
      console.error("Error:", error.message);
    }
    throw error;
  }
};
```

## Subscriptions

### Simple Subscription

```typescript
const MESSAGE_SUBSCRIPTION = `
  subscription OnNewMessage($chatId: ID!) {
    onNewMessage(chatId: $chatId) {
      id
      text
      sender {
        id
        name
      }
      createdAt
    }
  }
`;

function ChatScreen({ chatId }: { chatId: string }) {
  const graphql = useAdapter<GraphQLPort>("graphql");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const subscription = graphql.subscribe<{ onNewMessage: Message }>(
      MESSAGE_SUBSCRIPTION,
      {
        variables: { chatId },
      }
    );

    const { unsubscribe } = subscription.subscribe(
      (result) => {
        // Add new message
        setMessages(prev => [...prev, result.data.onNewMessage]);
      },
      (error) => {
        console.error("Subscription error:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  return (
    <View>
      {messages.map(message => (
        <Text key={message.id}>{message.text}</Text>
      ))}
    </View>
  );
}
```

## UseCase with GraphQL

```typescript
import { GraphQLPort } from "@natify/core";

const GET_PRODUCTS = `
  query GetProducts($category: String) {
    products(category: $category) {
      id
      name
      price
      image
    }
  }
`;

export class GetProductsUseCase {
  constructor(private readonly graphql: GraphQLPort) {}

  async execute(category?: string): Promise<Product[]> {
    const result = await this.graphql.query<{ products: Product[] }>(GET_PRODUCTS, {
      variables: { category },
    });

    return result.data.products;
  }
}
```

## Common Use Cases

### Login with GraphQL

```typescript
const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const login = async (email: string, password: string) => {
  const result = await graphql.mutate<{ login: { token: string; user: User } }>(
    LOGIN_MUTATION,
    {
      variables: { email, password },
    }
  );

  const { token, user } = result.data.login;

  // Save token
  await secureStorage.setItem("auth_token", token);

  // Inject token into GraphQL
  graphql.setAuthToken(token);

  return user;
};
```

### Automatically Refresh Token

```typescript
const graphqlAdapter = new ApolloGraphQLAdapter({
  uri: "https://api.example.com/graphql",
  onAuthError: async () => {
    // Try to refresh token
    const refreshToken = await secureStorage.getItem<string>("refresh_token");
    if (refreshToken) {
      const response = await http.post("/auth/refresh", { refreshToken });
      const newToken = response.data.token;
      
      // Update token
      await secureStorage.setItem("auth_token", newToken);
      graphql.setAuthToken(newToken);
      
      // Retry original request
      return;
    }

    // If no refresh token, logout
    await logout();
  },
});
```

### Cursor Pagination

```typescript
const GET_PRODUCTS_PAGINATED = `
  query GetProducts($cursor: String, $limit: Int) {
    products(cursor: $cursor, limit: $limit) {
      items {
        id
        name
        price
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const loadMoreProducts = async (cursor?: string) => {
  const result = await graphql.query<{
    products: { items: Product[]; pageInfo: PageInfo };
  }>(GET_PRODUCTS_PAGINATED, {
    variables: { cursor, limit: 20 },
  });

  return result.data.products;
};
```

## API

### GraphQLPort

| Method | Description |
|--------|-------------|
| `query<T>(query, options?)` | Executes a GraphQL query |
| `mutate<T>(mutation, options?)` | Executes a mutation |
| `subscribe<T>(subscription, options?)` | Subscribes to a subscription |
| `setAuthToken(token)` | Sets authentication token |
| `getAuthToken()` | Gets current token |
| `clearAuthToken()` | Clears token |
| `clearCache()` | Clears cache |
| `resetClient()` | Resets client |

### GraphQLOptions

```typescript
interface GraphQLOptions {
  variables?: Record<string, any>;
  context?: Record<string, any>;
  fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only' | 'no-cache';
  errorPolicy?: 'none' | 'ignore' | 'all';
}
```

### GraphQLResult

```typescript
interface GraphQLResult<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
  extensions?: Record<string, any>;
}
```

## Notes

- **Authentication Token**: Automatically injected into all requests when set with `setAuthToken()`
- **Cache**: Apollo Client handles cache automatically. Use `clearCache()` after logout
- **Errors**: All errors are converted to `NatifyError` with appropriate codes
- **Subscriptions**: Require a GraphQL server that supports WebSockets or Server-Sent Events
- **TypeScript**: Queries/mutations can be typed using generics

## Module Integration

```typescript
import { createModule } from "@natify/core";
import { GetProductsUseCase } from "./usecases/GetProductsUseCase";

export const ProductsModule = createModule("products", "Products")
  .requires("graphql")
  .useCase("getProducts", (adapters) => {
    return new GetProductsUseCase(adapters.graphql);
  })
  .build();
```
