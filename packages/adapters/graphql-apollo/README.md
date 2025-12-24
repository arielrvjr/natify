# @natify/graphql-apollo

Adapter de GraphQL para Natify Framework usando `@apollo/client`.

## Instalación

```bash
pnpm add @natify/graphql-apollo @apollo/client graphql
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No requiere configuración adicional.

## Uso

### Configuración Básica

```typescript
import { NatifyProvider } from "@natify/core";
import { ApolloGraphQLAdapter } from "@natify/graphql-apollo";

const graphqlAdapter = new ApolloGraphQLAdapter({
  uri: "https://api.example.com/graphql",
});

const config = {
  graphql: graphqlAdapter,
  // ... otros adapters
};

function App() {
  return (
    <NatifyProvider config={config}>
      <MyApp />
    </NatifyProvider>
  );
}
```

### Configuración Avanzada

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
    // Redirigir a login cuando hay error 401
    await logout();
    navigation.reset([{ name: "auth/Login" }]);
  },
  onNetworkError: (error) => {
    console.error("Network error:", error);
    // Mostrar notificación de error
  },
});
```

## Autenticación con Token

### Establecer Token Después del Login

```typescript
import { useAdapter, GraphQLPort, StoragePort } from "@natify/core";

function useAuth() {
  const graphql = useAdapter<GraphQLPort>("graphql");
  const secureStorage = useAdapter<StoragePort>("secureStorage");

  const login = async (email: string, password: string) => {
    // Login usando HTTP (o GraphQL mutation)
    const response = await http.post("/auth/login", { email, password });

    // Guardar token
    const token = response.data.token;
    await secureStorage.setItem("auth_token", token);

    // Inyectar token en GraphQL
    graphql.setAuthToken(token);
  };

  const logout = async () => {
    // Limpiar token
    graphql.clearAuthToken();
    await secureStorage.removeItem("auth_token");
    
    // Limpiar caché
    await graphql.clearCache();
  };

  return { login, logout };
}
```

### Restaurar Token al Iniciar la App

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

### Query Simple

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

### Query con Variables

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

### Query con Opciones de Caché

```typescript
// Siempre obtener datos frescos del servidor
const result = await graphql.query(GET_USERS, {
  fetchPolicy: "network-only",
});

// Usar caché si está disponible, sino hacer petición
const result = await graphql.query(GET_USERS, {
  fetchPolicy: "cache-and-network",
});

// Solo usar caché (no hacer petición)
const result = await graphql.query(GET_USERS, {
  fetchPolicy: "cache-only",
});
```

## Mutations

### Mutation Simple

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

### Mutation con Manejo de Errores

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
      errorPolicy: "all", // Retornar datos incluso si hay errores
    });

    if (result.errors && result.errors.length > 0) {
      // Manejar errores de GraphQL
      result.errors.forEach(error => {
        console.error("GraphQL Error:", error.message);
      });
    }

    return result.data.updateProfile;
  } catch (error) {
    if (error instanceof NatifyError) {
      // Manejar errores de red o validación
      console.error("Error:", error.message);
    }
    throw error;
  }
};
```

## Subscriptions

### Subscription Simple

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
        // Agregar nuevo mensaje
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

## UseCase con GraphQL

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

## Casos de Uso Comunes

### Login con GraphQL

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

  // Guardar token
  await secureStorage.setItem("auth_token", token);

  // Inyectar token en GraphQL
  graphql.setAuthToken(token);

  return user;
};
```

### Refrescar Token Automáticamente

```typescript
const graphqlAdapter = new ApolloGraphQLAdapter({
  uri: "https://api.example.com/graphql",
  onAuthError: async () => {
    // Intentar refrescar token
    const refreshToken = await secureStorage.getItem<string>("refresh_token");
    if (refreshToken) {
      const response = await http.post("/auth/refresh", { refreshToken });
      const newToken = response.data.token;
      
      // Actualizar token
      await secureStorage.setItem("auth_token", newToken);
      graphql.setAuthToken(newToken);
      
      // Reintentar la petición original
      return;
    }

    // Si no hay refresh token, hacer logout
    await logout();
  },
});
```

### Paginación con Cursor

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

| Método | Descripción |
|--------|-------------|
| `query<T>(query, options?)` | Ejecuta una query GraphQL |
| `mutate<T>(mutation, options?)` | Ejecuta una mutation |
| `subscribe<T>(subscription, options?)` | Suscribe a una subscription |
| `setAuthToken(token)` | Establece token de autenticación |
| `getAuthToken()` | Obtiene token actual |
| `clearAuthToken()` | Limpia token |
| `clearCache()` | Limpia caché |
| `resetClient()` | Resetea cliente |

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

## Notas

- **Token de Autenticación**: Se inyecta automáticamente en todas las peticiones cuando se establece con `setAuthToken()`
- **Caché**: Apollo Client maneja el caché automáticamente. Usa `clearCache()` después de logout
- **Errores**: Todos los errores se convierten a `NatifyError` con códigos apropiados
- **Subscriptions**: Requieren un servidor GraphQL que soporte WebSockets o Server-Sent Events
- **TypeScript**: Las queries/mutations pueden ser tipadas usando generics

## Integración con Módulos

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

