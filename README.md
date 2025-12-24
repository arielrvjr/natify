# Natify

**Natify** is a clean, modular architecture framework for React Native.

It decouples your business logic from native and third-party implementations
using **Ports & Adapters (Hexagonal Architecture)**.

Build faster. Refactor without fear. Swap implementations without touching your core.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.82+-61DAFB.svg)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Table of Contents

- [What is Natify?](#what-is-natify)
- [Why Natify?](#why-natify)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Integration Levels](#integration-levels)
- [Quick Start](#quick-start)
- [Use Cases](#use-cases)
- [Available Capabilities](#available-capabilities)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## What is Natify?

**Natify** is a hexagonal architecture (Ports & Adapters) framework designed specifically for React Native. Its main goal is to **decouple business logic from native implementations**, enabling developers to build more maintainable, testable, and scalable applications.

Natify implements **use cases** and **view models** to keep the UI layer clean and free of business logic, following Clean Architecture principles and separation of concerns.

### The Problem It Solves

In traditional React Native, your business code is **directly coupled** to specific libraries:

```typescript
// Coupled code - hard to test and change
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

async function login(email: string, password: string) {
  // If you change from axios to fetch, you must rewrite all calls
  const response = await axios.post('https://api.example.com/auth/login', {
    email,
    password,
  });
  // If you want to change to MMKV, you must search and replace in ALL code
  await AsyncStorage.setItem('token', response.data.token);
  
  return response.data.user;
}
```

With Natify, you use **interfaces** and change implementations without touching your code:

```typescript
// Decoupled code - easy to test and change
import { useAdapter, HttpClientPort, StoragePort } from '@natify/core';

function useLogin() {
  const http = useAdapter<HttpClientPort>('http');
  const storage = useAdapter<StoragePort>('storage');
  
  return async (email: string, password: string) => {
    const response = await http.post('/auth/login', { email, password });
  
    await storage.setItem('token', response.data.token);
  
    // Changing from AsyncStorage to MMKV or from axios to fetch
    // is just changing the adapter in App.tsx - this code does NOT change
    return response.data.user;
  };
}
```

---

## Why Natify?

React Native apps tend to couple business logic with libraries and native APIs.

Natify introduces a clear architectural boundary:

**UI → ViewModel → UseCase → Port → Adapter → Native**

This allows you to:
- **Change implementations** without rewriting business logic
- **Test easily** by mocking adapters
- **Keep your architecture** clean and future-proof

### For Teams and Projects

| Scenario                          | Benefit                                    |
| --------------------------------- | ------------------------------------------ |
| **Large teams (3+ devs)**         | Clear architecture, easy onboarding       |
| **Long-term projects**            | Maintainability and scalability            |
| **Enterprise apps**               | Governance and control over capabilities   |
| **Robust testing**                | Easy mocks, isolated tests                 |
| **Library migration**             | Change implementations without breaking code |

### Key Advantages

#### 1. Simplified Testing

```typescript
// In tests, simply mock the adapter
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// Your business code is tested without native dependencies
const useCase = new LoginUseCase(mockStorage);
```

#### 2. Implementation Flexibility

```typescript
// Development: AsyncStorage (simpler)
const storage = new AsyncStorageAdapter();

// Production: MMKV (30x faster)
const storage = new MMKVStorageAdapter();

// Your business code does NOT change
```

#### 3. Governance and Control

- **Typed interfaces** define what capabilities your app can use
- **Centralized adapters** facilitate security audits
- **Unified error system** for consistent handling

#### 4. Scalable Architecture

- **Module system**: Organize your app into independent modules
- **Use cases**: Encapsulated and testable business logic
- **View models**: Clear separation between UI and logic, clean and maintainable UI
- **Dependency injection**: Automatic dependency management
- **ActionBus**: Inter-module communication without coupling

---

## Architecture

Natify follows the **Hexagonal (Ports & Adapters)** pattern combined with **Clean Architecture**:

- **Ports (Interfaces)**: Contracts that define capabilities without implementation
- **Adapters**: Concrete implementations of Ports using native libraries
- **View Models** (Level 2): Handle UI state, loading, errors, and coordinate with use cases
- **Use Cases** (Level 2): Contain pure business logic, orchestrate adapters

### Principles

- **Dependencies point toward the domain** (Clean Architecture)
- **Layer separation**: UI → ViewModel → UseCase → Adapter
- **Clean UI**: Components only render, no business logic
- **Isolated use cases**: Use cases testable independently
- **Implementation-agnostic interfaces**
- **Testing without native dependencies**
- **Change libraries without affecting business code**

---

## Key Features

### Hexagonal Architecture

- Ports & Adapters pattern fully implemented
- Clear separation between business logic and infrastructure
- Inverted dependencies (Dependency Inversion Principle)

### Module System

- Organize your app into independent modules (Auth, Products, Profile, etc.)
- Each module explicitly declares its dependencies
- Dynamic module loading/unloading (Hot Reload)

### Dependency Injection

- DI Container with support for singletons and factories
- Automatic type inference for adapters
- `useAdapter<T>()` and `useUseCase<T>()` hooks for typed access

### ActionBus

- Inter-module communication without direct coupling
- Allows modules to communicate without knowing each other

### Strong Typing

- TypeScript throughout the framework
- Typed interfaces for all Ports
- Automatic type inference in adapters

### Use Cases

- Encapsulate pure business logic, independent of UI
- Receive injected adapters, don't depend on concrete implementations
- Highly testable without complex mocks
- One Use Case = One business responsibility

### View Models

- Base hook (`useBaseViewModel`) for automatic loading and error handling
- Coordinate between UI components and use cases
- Maintain UI state (loading, error, data)
- Reduce boilerplate in components
- Consistent state across the app

---

## Integration Levels

Natify offers **two integration levels** to adapt to your project's needs. You can integrate up to the level you want:

### Level 1: Abstraction Only (NatifyProvider)

**Ideal for:** Existing projects that only want to abstract native libraries without changing their architecture.

This level gives you access to **adapters and ports** (abstraction of implementations), but without the module system or full dependency injection.

#### Level 1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Native Components                │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  useAdapter<Port>() → Direct access         │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            NatifyProvider (DI + Registry)          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   PORTS     │  │   ERRORS    │  │   DI        │  │    │
│  │  │ (Interfaces)│  │(NatifyError)│  │ Container  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ▲                                 │
│                            │ implements                      │
│  ┌─────────────────────────┴───────────────────────────┐    │
│  │               @natify/*                             │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │    │
│  │  │http-axios│ │storage-  │ │biometrics│             │    │
│  │  │          │ │mmkv      │ │-rn       │             │    │
│  │  └──────────┘ └──────────┘ └──────────┘             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Includes: Ports, Errors, DI Container, Adapters
Does NOT include: Modules, Use Cases, View Models, ActionBus, Navigation
```

#### Level 1 Flow

1. **Core** defines interfaces (Ports) - `HttpClientPort`, `StoragePort`, etc.
2. **Adapters** implement interfaces using specific libraries
3. **NatifyProvider** registers adapters in the DI container
4. **UI Components** use `useAdapter<Port>()` to access adapters directly
5. Business logic can be in components or custom functions/hooks

```typescript
// App.tsx
import { NatifyProvider, useAdapter } from '@natify/core';
import { AxiosHttpAdapter } from '@natify/http-axios';
import { MMKVStorageAdapter } from '@natify/storage-mmkv';
import { HttpClientPort, StoragePort } from '@natify/core';

export default function App() {
  return (
    <NatifyProvider
      adapters={{
        http: new AxiosHttpAdapter('https://api.example.com'),
        storage: new MMKVStorageAdapter(),
      }}
    >
      <MyApp />
    </NatifyProvider>
  );
}

// Use adapters in components
function MyComponent() {
  const http = useAdapter<HttpClientPort>('http');
  const storage = useAdapter<StoragePort>('storage');
  
  const fetchData = async () => {
    const response = await http.get('/users');
    await storage.setItem('lastFetch', Date.now());
  };
  
  return <Button onPress={fetchData} title="Fetch" />;
}
```

**What you get:**

- Native library abstraction (Ports & Adapters)
- Typed adapter access with `useAdapter<T>()`
- Change implementations without touching business code
- Simplified testing with mocks

**What it does NOT include:**

- Module system
- Dependency injection for use cases
- Module Registry
- ActionBus
- Integrated navigation

---

### Level 2: Full Framework (NatifyApp)

**Ideal for:** New projects or refactorings seeking complete architecture with modules, use cases, and view models.

This level includes **the entire framework**: module system, dependency injection, Module Registry, ActionBus, and integrated navigation.

#### Level 2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Native Components                │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  View Models → useBaseViewModel()             │   │    │
│  │  │  useUseCase<T>() → Business cases           │   │    │
│  │  │  useAdapter<T>() → Direct access           │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NatifyApp (Full Framework)            │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  ModuleProvider → Module system              │ │    │
│  │  │  ModuleRegistry → Dependency validation      │ │    │
│  │  │  ActionBus → Inter-module communication      │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  NatifyProvider (DI + Registry)             │ │    │
│  │  │  ┌─────────────┐  ┌─────────────┐           │ │    │
│  │  │  │   PORTS     │  │   ERRORS    │           │ │    │
│  │  │  │ (Interfaces)│  │(NatifyError)│           │ │    │
│  │  │  └─────────────┘  └─────────────┘           │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  NavigationContainer + AppNavigator         │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ▲                                 │
│                            │ implements                      │
│  ┌─────────────────────────┴───────────────────────────┐    │
│  │               @natify/*                             │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │    │
│  │  │http-axios│ │storage-  │ │biometrics│ │nav-    │  │    │
│  │  │          │ │mmkv      │ │-rn       │ │react   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Includes: EVERYTHING (Ports, Errors, DI, Adapters, Modules, Use Cases, 
         View Models, ActionBus, Navigation, Module Registry)
```

#### Level 2 Flow

1. **Core** defines interfaces (Ports) - `HttpClientPort`, `StoragePort`, etc.
2. **Adapters** implement interfaces using specific libraries
3. **NatifyProvider** (internal) registers adapters in the DI container
4. **ModuleProvider** loads and validates modules with their dependencies
5. **Use Cases** encapsulate business logic and use injected adapters
6. **View Models** coordinate between UI and use cases, handle UI state
7. **UI Components** consume view models and remain free of business logic
8. Components use `useUseCase<T>()` for business cases and `useAdapter<Port>()` for direct adapter access

```typescript
// App.tsx
import { NatifyApp } from '@natify/core';
import { AxiosHttpAdapter } from '@natify/http-axios';
import { MMKVStorageAdapter } from '@natify/storage-mmkv';
import { createReactNavigationAdapter } from '@natify/navigation-react';

// Modules
import { AuthModule, ProductsModule } from './modules';

const adapters = {
  http: new AxiosHttpAdapter('https://api.example.com'),
  storage: new MMKVStorageAdapter(),
  navigation: createReactNavigationAdapter(),
};

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

**What you get:**

- Everything from Level 1
- Module system
- Complete dependency injection
- Use cases with `useUseCase<T>()`
- Module Registry (dependency validation)
- ActionBus (inter-module communication)
- Integrated navigation
- Hot reload of modules
- View models with `useBaseViewModel()`

---

### Level Comparison

| Feature                      | Level 1 (NatifyProvider) | Level 2 (NatifyApp) |
| ---------------------------- | ------------------------ | ------------------- |
| **Library abstraction**      | Yes                      | Yes                 |
| **useAdapter `<T>`()**       | Yes                      | Yes                 |
| **Module system**            | No                       | Yes                 |
| **useUseCase `<T>`()**       | No                       | Yes                 |
| **Module Registry**          | No                       | Yes                 |
| **ActionBus**                | No                       | Yes                 |
| **Integrated navigation**     | No                       | Yes                 |
| **Hot reload modules**        | No                       | Yes                 |
| **View Models**              | No                       | Yes                 |
| **Complexity**               | Low                      | Medium-High          |
| **Recommended for**          | Existing projects        | New projects        |

---

## Quick Start

### Installation

```bash
# Install core
pnpm add @natify/core @natify/ui

# Install required adapters
pnpm add @natify/http-axios
pnpm add @natify/storage-mmkv
pnpm add @natify/storage-keychain
pnpm add @natify/navigation-react
pnpm add @natify/biometrics-rn
pnpm add @natify/permissions-rn
pnpm add @natify/image-picker-rn
```

### Basic Setup (Level 1 - Abstraction Only)

If you prefer only abstraction without the full system:

```typescript
// App.tsx
import { NatifyProvider, useAdapter } from '@natify/core';
import { AxiosHttpAdapter } from '@natify/http-axios';
import { MMKVStorageAdapter } from '@natify/storage-mmkv';
import { HttpClientPort, StoragePort } from '@natify/core';

export default function App() {
  return (
    <NatifyProvider
      adapters={{
        http: new AxiosHttpAdapter('https://api.example.com'),
        storage: new MMKVStorageAdapter(),
      }}
    >
      <MyApp />
    </NatifyProvider>
  );
}

// Use in components
function MyComponent() {
  const http = useAdapter<HttpClientPort>('http');
  const storage = useAdapter<StoragePort>('storage');
  
  // Your logic here
}
```

### Basic Setup (Level 2 - Full Framework)

```typescript
// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NatifyApp } from '@natify/core';
import { ThemeProvider } from '@natify/ui';

// Adapters
import { AxiosHttpAdapter } from '@natify/http-axios';
import { MMKVStorageAdapter } from '@natify/storage-mmkv';
import { KeychainStorageAdapter } from '@natify/storage-keychain';
import { createReactNavigationAdapter } from '@natify/navigation-react';

// Modules
import { AuthModule, ProductsModule } from './modules';

const adapters = {
  http: new AxiosHttpAdapter('https://api.example.com'),
  storage: new MMKVStorageAdapter(),
  secureStorage: new KeychainStorageAdapter(),
  navigation: createReactNavigationAdapter(),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NatifyApp
          adapters={adapters}
          modules={[AuthModule, ProductsModule]}
          initialModule="auth"
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

### Create a Module (Level 2 Only)

```typescript
// modules/auth/index.ts
import { createModule } from '@natify/core';
import { LoginScreen } from './screens/LoginScreen';
import { LoginUseCase } from './usecases/LoginUseCase';

export const AuthModule = createModule('auth', 'Authentication')
  .requires('http', 'secureStorage', 'navigation')
  .screen({ name: 'Login', component: LoginScreen })
  .useCase('login', (adapters) => 
    new LoginUseCase(adapters.http, adapters.secureStorage)
  )
  .initialRoute('Login')
  .build();
```

### Create a View Model (Level 2 Only)

```typescript
// viewmodels/useLoginViewModel.ts
import { useBaseViewModel, useUseCase, useAdapter, NavigationPort } from '@natify/core';
import { useState, useCallback } from 'react';
import { LoginUseCase } from '../usecases/LoginUseCase';

export function useLoginViewModel() {
  // Base state (loading, error)
  const [baseState, { execute, clearError }] = useBaseViewModel();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Injected use case (prefix: moduleId:useCaseKey)
  const loginUseCase = useUseCase<LoginUseCase>('auth:login');
  
  // Navigation
  const navigation = useAdapter<NavigationPort>('navigation');

  const login = useCallback(async () => {
    const result = await execute(() =>
      loginUseCase.execute({ email, password })
    );

    if (result) {
      navigation.navigate('products/ProductList');
    }
  }, [email, password, loginUseCase, navigation, execute]);

  return {
    state: {
      ...baseState,
      email,
      password,
    },
    actions: {
      setEmail,
      setPassword,
      login,
      clearError,
    },
  };
}
```

### Use View Model in a Component (Clean UI)

```typescript
// screens/LoginScreen.tsx
import { View, TextInput, Button, ActivityIndicator } from 'react-native';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export function LoginScreen() {
  // Component only consumes the view model, no business logic
  const { state, actions } = useLoginViewModel();

  return (
    <View>
      <TextInput
        value={state.email}
        onChangeText={actions.setEmail}
        placeholder="Email"
        editable={!state.isLoading}
      />
      <TextInput
        value={state.password}
        onChangeText={actions.setPassword}
        secureTextEntry
        editable={!state.isLoading}
      />
  
      {state.error && (
        <Text style={{ color: 'red' }}>{state.error.message}</Text>
      )}
  
      {state.isLoading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Sign In" onPress={actions.login} />
      )}
    </View>
  );
}
```

---

## Use Cases

### Ideal For

- **Enterprise applications** requiring long-term maintainability
- **Large teams** needing structure and governance
- **Complex projects** with multiple modules/features
- **Apps requiring robust testing** (high test coverage)
- **Projects that migrate libraries frequently** (e.g., changing from AsyncStorage to MMKV)
- **Organizations needing control** over what native capabilities are used

### Not Recommended For

- **Quick prototypes** (unnecessary overhead)
- **Very simple apps** (single screen, no complex logic)
- **1-2 person teams** (may be excessive)
- **Projects with very short timelines** (initial setup takes time)

---

## Available Capabilities

### Implemented

| Capability              | Adapter                              | Underlying Library                    |
| ----------------------- | ------------------------------------ | ------------------------------------- |
| **Analytics**           | `@natify/analytics-mixpanel`         | mixpanel-react-native                 |
| **Biometrics**          | `@natify/biometrics-rn`              | react-native-biometrics               |
| **Error Reporting**     | `@natify/error-reporting-sentry`     | @sentry/react-native                  |
| **Feature Flags**       | `@natify/feature-flag-growthbook`     | @growthbook/growthbook-react          |
| **File System**         | `@natify/file-system-rn`             | react-native-blob-util                |
| **Geolocation**         | `@natify/geolocation-rn`             | @react-native-community/geolocation   |
| **GraphQL**             | `@natify/graphql-apollo`             | @apollo/client                        |
| **HTTP Client**         | `@natify/http-axios`                 | Axios                                 |
| **Image Picker**        | `@natify/image-picker-rn`            | react-native-image-picker             |
| **Navigation**           | `@natify/navigation-react`            | React Navigation                      |
| **Permissions**         | `@natify/permissions-rn`             | react-native-permissions              |
| **Push Notifications**  | `@natify/push-notification-firebase` | @react-native-firebase/messaging      |
| **Push Notifications**  | `@natify/push-notification-notifee`  | @notifee/react-native                  |
| **Secure Storage**      | `@natify/storage-keychain`            | react-native-keychain                 |
| **State Management**    | `@natify/store-zustand`               | Zustand                               |
| **Storage**             | `@natify/storage-async`               | AsyncStorage                          |
| **Storage**             | `@natify/storage-mmkv`                | react-native-mmkv (30x faster)        |

### Planned

- Camera/Media (react-native-vision-camera)
- Theme Engine (@shopify/restyle)
- Toast/Alerts (react-native-toast-message)

---

## Comparison with Alternatives

### Natify vs Expo

| Aspect         | Expo                    | Natify                    |
| -------------- | ----------------------- | ------------------------- |
| **Purpose**    | Development platform    | Architecture framework    |
| **Setup**      | Very fast               | Slower                    |
| **Flexibility** | Limited (managed)       | High                      |
| **Testing**    | Standard                | Easier                    |
| **Architecture** | Doesn't impose        | Hexagonal                 |
| **Build System** | EAS Build              | Manual                    |

**Recommendation**: Use **Expo for tooling** (EAS Build, Updates) + **Natify for architecture**.

### Natify vs Pure React Native

| Aspect                  | Pure RN                      | Natify                        |
| ----------------------- | ---------------------------- | ----------------------------- |
| **Testing**             | Difficult (complex mocks)    | Easy (mockable adapters)      |
| **Maintainability**     | Depends on team              | Clear structure               |
| **Library migration**    | Search/replace everything    | Change adapter                |
| **Onboarding**          | Depends on project           | Documented architecture       |
| **Governance**          | Manual                       | Typed interfaces              |

---

## Documentation

- **[Core Package](./packages/core/README.md)** - Architecture, modules, DI
- **[UI Package](./packages/ui/README.md)** - Reusable components
- **[Adapters](./packages/adapters/)** - Documentation for each adapter
- **[Examples App](./apps/examples/)** - Complete demonstration app

### Guides

See documentation in [`.cursorrules`](.cursorrules) for:

- How to create a Port
- How to create an Adapter
- How to create a Module
- Testing with Natify

---

## Tech Stack

| Tool            | Version | Purpose                      |
| --------------- | ------- | ---------------------------- |
| **pnpm**        | 10.24.0 | Package manager (workspaces) |
| **Turbo**       | 2.6.2   | Build system monorepo        |
| **TypeScript**  | 5.9.3   | Static typing                |
| **React Native** | 0.82+  | Mobile framework             |
| **React**       | 19.1.1  | UI library                   |

---

## Complete Example

See the complete example app in [`apps/examples/`](./apps/examples/) which includes:

- Authentication Module (Login, Register)
- Products Module (List, Detail)
- Profile Module (Settings, Biometrics, Permissions)
- Integration of all adapters
- View models with `useBaseViewModel`
- Use cases with dependency injection
- Navigation between modules

```bash
# Run example app
cd apps/examples
pnpm install
pnpm ios    # or pnpm android
```

---

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guides

See [`.cursorrules`](.cursorrules) for:

- How to create a new Adapter
- How to create a new Port
- Code and architecture conventions

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

- [Complete Documentation](./packages/core/README.md)
- [Example App](./apps/examples/)
- [Report Issues](https://github.com/arielrvjr/natify/issues)

---

## Learn More

### Key Concepts

- **Hexagonal Architecture** - See architecture section in this README
- **Ports & Adapters** - Interfaces defined in `packages/core/src/ports/`
- **Module System** - See `packages/core/src/module/`
- **Dependency Injection** - See `packages/core/src/di/`

### Practical Examples

- See [`apps/examples/`](./apps/examples/) for a complete app
- Each adapter has its own README with examples in `packages/adapters/*/README.md`
- See [`.cursorrules`](.cursorrules) for detailed guides

---

## Roadmap

### Upcoming Capabilities

- **Camera/Media** - react-native-vision-camera
- **Location** - react-native-geolocation-service
- **File System** - react-native-blob-util
- **Theme Engine** - @shopify/restyle
- **Toast/Alerts** - react-native-toast-message
- **Crash Reporting** - Sentry integration
- **Validation** - Zod schemas

### Planned Improvements

- Improved hot reload for modules
- Metrics and telemetry
- Improved testing utilities
- Code generators (CLI)

---

## Compatibility

### React Native

- **0.82+** (Recommended)
- Compatible with Expo (using Expo adapters)
- Compatible with bare React Native

### TypeScript

- **5.9+** (Recommended)
- Full typing throughout the framework

---

<div align="center">

**Made for the React Native community**

**Star this repo** if you find it useful

[Documentation](./packages/core/README.md) • [Examples](./apps/examples/) • [Issues](https://github.com/arielrvjr/natify/issues)

</div>
