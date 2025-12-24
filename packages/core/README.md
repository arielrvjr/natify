# @natify/core

Core of the Natify framework. Provides hexagonal architecture, module system, dependency injection, and tools for building decoupled React Native applications.

## Installation

```bash
pnpm add @natify/core
```

## Features

- **Hexagonal Architecture** - Ports & Adapters pattern
- **Module System** - Organize your app into independent mini-apps
- **Dependency Injection** - DI Container with singletons and factories
- **ActionBus** - Inter-module communication (MediatR style)
- **Generic Types** - Automatic type inference for adapters
- **Hot Reload** - Dynamic module loading/unloading
- **Included Adapters** - Logger and Analytics by default

---

## Layer Architecture (Recommended)

Natify recommends following Clean Architecture with layer separation, but **it's flexible and you can use it without ViewModels** if you prefer a simpler approach.

### Recommended Architecture

```
┌─────────────────────────────────────┐
│         UI Layer (Views)            │  ← Pure React Native components
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      ViewModels (UI State)          │  ← Handle loading, errors, state
│         [OPTIONAL]                   │  ← You can skip this layer
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    UseCases (Business Logic)        │  ← Pure, testable use cases
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Ports (Interfaces)             │  ← Contracts without implementation
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Adapters (Implementations)       │  ← Concrete native libraries
└─────────────────────────────────────┘
```

**Principles:**
- **Dependencies point toward the domain** - Outer layers depend on inner layers
- **Clean UI** - Components only render, no business logic
- **Isolated UseCases** - Business logic independent of frameworks
- **Agnostic interfaces** - Ports don't know about implementations

### Using with ViewModels (Recommended)

```typescript
// ViewModel handles state and coordinates with UseCase
export function useLoginViewModel() {
  const [state, { execute }] = useBaseViewModel();
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");

  const login = async (email: string, password: string) => {
    const result = await execute(() => 
      loginUseCase.execute({ email, password })
    );
    return result;
  };

  return { state, actions: { login } };
}

// Clean component, only renders
function LoginScreen() {
  const { state, actions } = useLoginViewModel();
  return <Button onPress={() => actions.login(email, password)} />;
}
```

### Using without ViewModels (Also valid)

You can use Natify directly in components if you prefer a simpler approach:

```typescript
// Component that uses UseCase directly
function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await loginUseCase.execute({ email, password });
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return <Button onPress={handleLogin} disabled={isLoading} />;
}
```

**Note:** ViewModels are **optional** but recommended for:
- Complex applications with multiple states
- Teams seeking clear separation of responsibilities
- Projects requiring exhaustive UI logic testing

For quick prototypes or simple apps, you can use UseCases directly in components.

---

## Quick Guide

### 1. Configure Adapters

```typescript
import { NatifyApp, ConsoleLoggerAdapter } from "@natify/core";
import { AxiosHttpAdapter } from "@natify/http-axios";
import { MMKVStorageAdapter } from "@natify/storage-mmkv";
import { createReactNavigationAdapter } from "@natify/navigation-react";

const adapters = {
  http: new AxiosHttpAdapter("https://api.example.com"),
  storage: new MMKVStorageAdapter(),
  navigation: createReactNavigationAdapter(),
  // Logger is optional, ConsoleLoggerAdapter is used by default if not provided
  logger: new ConsoleLoggerAdapter(),
};
```

### 2. Create Modules

```typescript
import { createModule } from "@natify/core";

export const AuthModule = createModule("auth", "Authentication")
  .requires("http", "storage", "navigation")
  .screen({ name: "Login", component: LoginScreen })
  .useCase("login", (adapters) => new LoginUseCase(adapters.http, adapters.storage))
  .initialRoute("Login")
  .build();
```

### 3. Configure App

```typescript
import { NatifyApp } from "@natify/core";

export default function App() {
  return (
    <NatifyApp
      adapters={adapters}
      modules={[AuthModule, ProductsModule]}
      initialModule="auth"
    />
  );
}
```

---

## Adapters Included in Core

### ConsoleLoggerAdapter

Logging adapter that uses `console` to write logs. Used automatically if you don't provide a logger in the configuration.

```typescript
import { ConsoleLoggerAdapter } from "@natify/core";

const logger = new ConsoleLoggerAdapter();

// Use directly
logger.info("User authenticated", { userId: "123" });
logger.error("Error loading data", error);

// Or inject it in adapters
const adapters = {
  logger: new ConsoleLoggerAdapter(),
  // ... other adapters
};
```

**Available log levels:**
- `logger.debug(message, metadata?)`
- `logger.info(message, metadata?)`
- `logger.warn(message, metadata?)`
- `logger.error(message, error?, metadata?)`

### CompositeAnalyticsAdapter

Analytics adapter that allows combining multiple analytics providers into one. Useful when you need to send events to multiple services simultaneously.

```typescript
import { CompositeAnalyticsAdapter } from "@natify/core";
import { FirebaseAnalyticsAdapter } from "@natify/analytics-firebase";
import { MixpanelAnalyticsAdapter } from "@natify/analytics-mixpanel";

// Create individual adapters
const firebase = new FirebaseAnalyticsAdapter();
const mixpanel = new MixpanelAnalyticsAdapter();

// Combine them into a single adapter
const analytics = new CompositeAnalyticsAdapter([firebase, mixpanel]);

// Initialize all
await analytics.init();

// Events are sent to all adapters
analytics.track("user_login", { method: "email" });
// ↑ Sent to both Firebase and Mixpanel
```

**Available methods:**
- `analytics.init()` - Initializes all adapters
- `analytics.identify(userId, traits?)` - Identifies a user
- `analytics.track(event, properties?)` - Records an event
- `analytics.screen(name, properties?)` - Records a screen
- `analytics.reset()` - Resets all adapters

---

## useAdapter vs useUseCase

### `useAdapter<T>(name)` - Direct adapter access

Use `useAdapter` when you need direct access to a framework adapter, typically for:

- **Navigation** (`navigation`)
- **Logging** (`logger`)
- **Simple operations** without business logic

```typescript
import { useAdapter, NavigationPort, LoggerPort } from "@natify/core";

function MyComponent() {
  const navigation = useAdapter<NavigationPort>("navigation");
  const logger = useAdapter<LoggerPort>("logger");

  const handlePress = () => {
    logger.info("Navigating to product detail");
    navigation.navigate("products/ProductDetail", { id: "123" });
  };
}
```

### `useUseCase<T>(key)` - Encapsulated business logic

Use `useUseCase` when the operation involves business logic, such as:

- **Login/Logout**
- **CRUD operations**
- **Complex validations**

```typescript
import { useUseCase } from "@natify/core";
import { LoginUseCase } from "../usecases/LoginUseCase";

function LoginScreen() {
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");

  const handleLogin = async (email: string, password: string) => {
    await loginUseCase.execute({ email, password });
  };
}
```

### General Rule

| Situation | Hook to use |
|-----------|-------------|
| Simple navigation | `useAdapter<NavigationPort>` |
| Logging | `useAdapter<LoggerPort>` |
| Business logic | `useUseCase<MyUseCase>` |
| Trivial operations (save setting) | `useAdapter` is fine |

---

## ActionBus - Inter-Module Communication

The ActionBus allows modules to communicate without directly coupling.

### Register Handler (in the module that provides the action)

```typescript
import { actionBus } from "@natify/core";

// In AuthModule
export const AuthModule = createModule("auth", "Authentication")
  .onInit(async (adapters) => {
    actionBus.register("auth:logout", async () => {
      await logoutUseCase.execute();
    });
  })
  .build();
```

### Dispatch Action (from any module)

```typescript
import { useActionDispatch } from "@natify/core";

function ProfileScreen() {
  const dispatch = useActionDispatch();

  const handleLogout = async () => {
    await dispatch({ type: "auth:logout" });
  };
}
```

---

## Module Hot Reload

```typescript
import { useDynamicModules } from "@natify/core";
import { PremiumModule } from "./modules/premium";

function SettingsScreen() {
  const { loadModule, unloadModule, isModuleLoaded } = useDynamicModules();

  const togglePremium = async () => {
    if (isModuleLoaded("premium")) {
      await unloadModule("premium");
    } else {
      await loadModule(PremiumModule);
    }
  };
}
```

---

## Navigation Hooks

```typescript
import { useNavigationParams, useCurrentRoute, useAdapter, NavigationPort } from "@natify/core";

function ProductDetail() {
  // Get typed parameters
  const { productId } = useNavigationParams<{ productId: string }>();

  // Navigation using the adapter directly
  const navigation = useAdapter<NavigationPort>("navigation");

  // Current route
  const currentRoute = useCurrentRoute();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNavigate = () => {
    navigation.navigate("products/ProductList");
  };
}
```

---

## BaseViewModel

Base hook for ViewModels with loading and error handling:

```typescript
import { useBaseViewModel, useUseCase } from "@natify/core";

export function useLoginViewModel() {
  const [state, { execute, clearError }] = useBaseViewModel();
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");

  const login = async (email: string, password: string) => {
    const result = await execute(() => 
      loginUseCase.execute({ email, password })
    );
    
    if (result) {
      // Success
    }
  };

  return {
    state, // { isLoading, error }
    actions: { login, clearError },
  };
}
```

**BaseViewModel state:**
- `state.isLoading` - Indicates if there's an operation in progress
- `state.error` - Error from the last operation (if any)
- `execute(fn)` - Executes an async function and handles loading/error automatically
- `clearError()` - Clears the current error

---

## Available Ports

The core defines the following interfaces (Ports) that must be implemented by adapters:

- `HttpClientPort` - HTTP client for REST requests
- `StoragePort` - Local storage (key-value)
- `NavigationPort` - Navigation between screens
- `BiometricPort` - Biometric authentication
- `PermissionPort` - Device permission management
- `ImagePickerPort` - Image selection from gallery or camera
- `LoggerPort` - Logging system
- `AnalyticsPort` - Event tracking and analytics
- `StateManagerPort` - Global state management
- `GraphQLPort` - GraphQL client (optional)

Each Port defines a contract that adapters must fulfill, allowing swapping implementations without changing business code.

---

## Error System

Natify provides a typed and consistent error system:

```typescript
import { NatifyError, NatifyErrorCode } from "@natify/core";

// Create a typed error
throw new NatifyError(
  NatifyErrorCode.NETWORK_ERROR,
  "Could not connect to server",
  originalError,
  { url: "/api/users", retries: 3 }
);

// Handle errors
try {
  await http.get("/users");
} catch (error) {
  if (error instanceof NatifyError) {
    switch (error.code) {
      case NatifyErrorCode.UNAUTHORIZED:
        // Redirect to login
        break;
      case NatifyErrorCode.NETWORK_ERROR:
        // Show no connection message
        break;
    }
  }
}
```

**Available error codes:**
- `NETWORK_ERROR` - Generic network error
- `TIMEOUT` - Request timeout
- `UNAUTHORIZED` - HTTP 401
- `FORBIDDEN` - HTTP 403
- `NOT_FOUND` - HTTP 404
- `SERVER_ERROR` - HTTP 500+
- `STORAGE_READ_ERROR` - Error reading storage
- `STORAGE_WRITE_ERROR` - Error writing storage
- `VALIDATION_ERROR` - Validation error
- `UNKNOWN` - Unknown error

---

## Main Exports

```typescript
// Ports (Interfaces)
export { 
  HttpClientPort, 
  StoragePort, 
  NavigationPort, 
  BiometricPort,
  PermissionPort,
  ImagePickerPort,
  LoggerPort,
  AnalyticsPort,
  StateManagerPort,
  GraphQLPort,
  Port 
}

// Context
export { NatifyProvider, useAdapter }

// Dependency Injection
export { DIContainer, container, useUseCase }

// Module System
export { createModule, useModules, useDynamicModules }

// ViewModel
export { useBaseViewModel }

// Navigation Hooks
export { useNavigationParams, useCurrentRoute }

// ActionBus
export { actionBus, useActionDispatch, useActionHandler }

// App
export { NatifyApp, DefaultSplash }

// Errors
export { NatifyError, NatifyErrorCode }

// Adapters (included in core)
export { ConsoleLoggerAdapter, CompositeAnalyticsAdapter }
```

---

## Testing

Natify facilitates testing through dependency injection:

```typescript
// Mock an adapter
const mockStorage = {
  getItem: jest.fn().mockResolvedValue("token"),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  capability: "storage" as const,
};

// Test a UseCase without native dependencies
const loginUseCase = new LoginUseCase(mockStorage);
const result = await loginUseCase.execute({ email: "test@example.com", password: "123" });

expect(mockStorage.setItem).toHaveBeenCalledWith("auth_token", expect.any(String));
```

---

## More Information

- [Main README](../README.md) - Complete framework documentation
- [Usage Examples](../../apps/examples/) - Complete demo app
- [Development Guides](../../.cursorrules) - Conventions and best practices
