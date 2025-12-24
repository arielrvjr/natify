# @natify/http-axios

HTTP adapter for Natify Framework using `axios`.

## Installation

```bash
pnpm add @natify/http-axios axios
```

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { AxiosHttpAdapter } from "@natify/http-axios";

// Basic configuration
const httpAdapter = new AxiosHttpAdapter("https://api.example.com");

// Advanced configuration with interceptors
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
      // Add token to all requests
      const token = getAuthToken();
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    onResponseError: async (error) => {
      // Handle errors globally (e.g., refresh token)
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

### Usage in Components

```typescript
import { useAdapter, HttpClientPort, NatifyError, NatifyErrorCode } from "@natify/core";

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
      if (error instanceof NatifyError) {
        switch (error.code) {
          case NatifyErrorCode.UNAUTHORIZED:
            navigateToLogin();
            break;
          case NatifyErrorCode.NETWORK_ERROR:
            showToast("No internet connection");
            break;
          case NatifyErrorCode.SERVER_ERROR:
            showToast("Server error, please try again later");
            break;
        }
      }
    }
  };

  return <FlatList data={users} ... />;
}
```

### CRUD Operations

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

### Per-Request Configuration

```typescript
// Custom headers
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

// Specific timeout
const response = await http.get<Data>("/slow-endpoint", {
  timeout: 30000,
});

// Cancellation with AbortController
const controller = new AbortController();
const response = await http.get<Data>("/data", {
  signal: controller.signal,
});
// To cancel: controller.abort();
```

### Global Headers

```typescript
const http = useAdapter<HttpClientPort>("http");

// Add global header (e.g., after login)
http.setHeader("Authorization", `Bearer ${token}`);

// Remove global header (e.g., after logout)
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

| Method | Return | Description |
|--------|--------|-------------|
| `get<T>(url, config?)` | `Promise<HttpResponse<T>>` | GET request |
| `post<T>(url, body?, config?)` | `Promise<HttpResponse<T>>` | POST request |
| `put<T>(url, body?, config?)` | `Promise<HttpResponse<T>>` | PUT request |
| `patch<T>(url, body?, config?)` | `Promise<HttpResponse<T>>` | PATCH request |
| `delete<T>(url, config?)` | `Promise<HttpResponse<T>>` | DELETE request |
| `setHeader(key, value)` | `void` | Adds global header |
| `removeHeader(key)` | `void` | Removes global header |

### HttpResponse

```typescript
interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  requestUrl?: string;
}
```

## Error Handling

The adapter automatically converts HTTP errors to `NatifyError`:

| HTTP Code | NatifyErrorCode |
|-----------|-----------------|
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 500+ | `SERVER_ERROR` |
| Timeout | `TIMEOUT` |
| No connection | `NETWORK_ERROR` |
