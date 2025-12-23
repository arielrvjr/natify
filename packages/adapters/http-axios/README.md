# @nativefy/http-axios

Adapter HTTP para Nativefy Framework usando `axios`.

## Instalación

```bash
pnpm add @nativefy/http-axios axios
```

## Uso

### Configuración del Provider

```typescript
import { NativefyProvider } from "@nativefy/core";
import { AxiosHttpAdapter } from "@nativefy/http-axios";

// Configuración básica
const httpAdapter = new AxiosHttpAdapter("https://api.example.com");

// Configuración avanzada con interceptors
const httpAdapterAdvanced = new AxiosHttpAdapter(
  "https://api.example.com",
  {
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  },
  {
    onRequest: (config) => {
      // Agregar token a todas las peticiones
      const token = getAuthToken();
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    onResponseError: async (error) => {
      // Manejar errores globalmente (ej: refresh token)
      if (error.response?.status === 401) {
        await refreshToken();
        return axios.request(error.config);
      }
      return Promise.reject(error);
    },
  }
);

const config = {
  http: httpAdapterAdvanced,
  // ... otros adapters
};

function App() {
  return (
    <NativefyProvider config={config}>
      <MyApp />
    </NativefyProvider>
  );
}
```

### Uso en Componentes

```typescript
import { useAdapter, HttpClientPort, NativefyError, NativefyErrorCode } from "@nativefy/core";

interface User {
  id: number;
  name: string;
  email: string;
}

function UserList() {
  const http = useAdapter<HttpClientPort>("http");
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await http.get<User[]>("/users");
      setUsers(response.data);
    } catch (error) {
      if (error instanceof NativefyError) {
        switch (error.code) {
          case NativefyErrorCode.UNAUTHORIZED:
            navigateToLogin();
            break;
          case NativefyErrorCode.NETWORK_ERROR:
            showToast("Sin conexión a internet");
            break;
          case NativefyErrorCode.SERVER_ERROR:
            showToast("Error del servidor, intenta más tarde");
            break;
        }
      }
    }
  };

  return <FlatList data={users} ... />;
}
```

### Operaciones CRUD

```typescript
const http = useAdapter<HttpClientPort>("http");

// GET
const { data: users } = await http.get<User[]>("/users");
const { data: user } = await http.get<User>("/users/1");

// POST
const { data: newUser } = await http.post<User>("/users", {
  name: "John Doe",
  email: "john@example.com",
});

// PUT
const { data: updatedUser } = await http.put<User>("/users/1", {
  name: "John Updated",
});

// PATCH
const { data: patchedUser } = await http.patch<User>("/users/1", {
  email: "new@example.com",
});

// DELETE
await http.delete("/users/1");
```

### Configuración por Petición

```typescript
// Headers personalizados
const response = await http.get<Data>("/protected", {
  headers: {
    "X-Custom-Header": "value",
  },
});

// Query params
const response = await http.get<User[]>("/users", {
  params: {
    page: 1,
    limit: 10,
    sort: "name",
  },
});

// Timeout específico
const response = await http.get<Data>("/slow-endpoint", {
  timeout: 30000,
});

// Cancelación con AbortController
const controller = new AbortController();
const response = await http.get<Data>("/data", {
  signal: controller.signal,
});
// Para cancelar: controller.abort();
```

### Headers Globales

```typescript
const http = useAdapter<HttpClientPort>("http");

// Agregar header global (ej: después de login)
http.setHeader("Authorization", `Bearer ${token}`);

// Remover header global (ej: después de logout)
http.removeHeader("Authorization");
```

## API

### Constructor

```typescript
new AxiosHttpAdapter(
  baseURL?: string,
  config?: AxiosRequestConfig,
  interceptors?: {
    onRequest?: (config) => config;
    onResponseError?: (error) => Promise<any>;
  }
)
```

### HttpClientPort

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `get<T>(url, config?)` | `Promise<HttpResponse<T>>` | Petición GET |
| `post<T>(url, body?, config?)` | `Promise<HttpResponse<T>>` | Petición POST |
| `put<T>(url, body?, config?)` | `Promise<HttpResponse<T>>` | Petición PUT |
| `patch<T>(url, body?, config?)` | `Promise<HttpResponse<T>>` | Petición PATCH |
| `delete<T>(url, config?)` | `Promise<HttpResponse<T>>` | Petición DELETE |
| `setHeader(key, value)` | `void` | Agrega header global |
| `removeHeader(key)` | `void` | Remueve header global |

### HttpResponse

```typescript
interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  requestUrl?: string;
}
```

## Manejo de Errores

El adapter convierte automáticamente los errores HTTP a `NativefyError`:

| Código HTTP | NativefyErrorCode |
|-------------|-------------------|
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 500+ | `SERVER_ERROR` |
| Timeout | `TIMEOUT` |
| Sin conexión | `NETWORK_ERROR` |

