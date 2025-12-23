# Nativefy Framework

> **Framework de arquitectura hexagonal para React Native** que abstrae dependencias nativas y proporciona una API unificada, tipada y testeable.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.82+-61DAFB.svg)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Tabla de Contenidos

- [¿Qué es Nativefy?](#qué-es-nativefy)
- [¿Por qué Nativefy?](#por-qué-nativefy)
- [Arquitectura](#arquitectura)
- [Características Principales](#características-principales)
- [Niveles de Integración](#niveles-de-integración)
- [Quick Start](#quick-start)
- [Casos de Uso](#casos-de-uso)
- [Capacidades Disponibles](#capacidades-disponibles)
- [Comparación con Alternativas](#comparación-con-alternativas)
- [Documentación](#documentación)
- [Contribuir](#contribuir)

---

## ¿Qué es Nativefy?

**Nativefy Framework** es un framework de arquitectura hexagonal (Ports & Adapters) diseñado específicamente para React Native. Su objetivo principal es **desacoplar la lógica de negocio de las implementaciones nativas**, permitiendo que desarrolladores construyan aplicaciones más mantenibles, testeables y escalables.

Nativefy implementa **casos de negocio (UseCases)** y **ViewModels** para mantener la capa de UI limpia y libre de lógica de negocio, siguiendo los principios de Clean Architecture y separación de responsabilidades.

### El Problema que Resuelve

En React Native tradicional, tu código de negocio está **acoplado directamente** a librerías específicas:

```typescript
// Código acoplado - difícil de testear y cambiar
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

async function login(email: string, password: string) {
  // Si cambias de axios a fetch, debes reescribir todas las llamadas
  const response = await axios.post('https://api.example.com/auth/login', {
    email,
    password,
  });
  // Si quieres cambiar a MMKV, debes buscar y reemplazar en TODO el código
  await AsyncStorage.setItem('token', response.data.token);
  
  return response.data.user;
}
```

Con Nativefy, usas **interfaces** y cambias implementaciones sin tocar tu código:

```typescript
// Código desacoplado - fácil de testear y cambiar
import { useAdapter, HttpClientPort, StoragePort } from '@nativefy/core';

function useLogin() {
  const http = useAdapter<HttpClientPort>('http');
  const storage = useAdapter<StoragePort>('storage');
  
  return async (email: string, password: string) => {
    const response = await http.post('/auth/login', { email, password });
  
    await storage.setItem('token', response.data.token);
  
    // Cambiar de AsyncStorage a MMKV o de axios a fetch
    // es solo cambiar el adapter en App.tsx - este código NO cambia
    return response.data.user;
  };
}
```

---

## ¿Por qué Nativefy?

### Para Equipos y Proyectos

| Escenario                           | Beneficio                                   |
| ----------------------------------- | ------------------------------------------- |
| **Equipos grandes (3+ devs)** | Arquitectura clara, fácil onboarding       |
| **Proyectos a largo plazo**   | Mantenibilidad y escalabilidad              |
| **Apps empresariales**        | Governance y control sobre capacidades      |
| **Testing robusto**           | Mocks fáciles, tests aislados              |
| **Migración de librerías**  | Cambiar implementaciones sin romper código |

### Ventajas Clave

#### 1. Testing Simplificado

```typescript
// En tests, simplemente mockeas el adapter
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// Tu código de negocio se testea sin dependencias nativas
const useCase = new LoginUseCase(mockStorage);
```

#### 2. Flexibilidad de Implementación

```typescript
// Desarrollo: AsyncStorage (más simple)
const storage = new AsyncStorageAdapter();

// Producción: MMKV (30x más rápido)
const storage = new MMKVStorageAdapter();

// Tu código de negocio NO cambia
```

#### 3. Governance y Control

- **Interfaces tipadas** definen qué capacidades puede usar tu app
- **Adapters centralizados** facilitan auditorías de seguridad
- **Sistema de errores unificado** para manejo consistente

#### 4. Arquitectura Escalable

- **Sistema de módulos**: Organiza tu app en módulos independientes
- **Casos de negocio (UseCases)**: Lógica de negocio encapsulada y testeable
- **ViewModels**: Separación clara entre UI y lógica, UI limpia y mantenible
- **Inyección de dependencias**: Gestión automática de dependencias
- **ActionBus**: Comunicación inter-módulo sin acoplamiento

---

## Arquitectura

Nativefy sigue el patrón **Hexagonal (Ports & Adapters)** combinado con **Clean Architecture**:

- **Ports (Interfaces)**: Contratos que definen capacidades sin implementación
- **Adapters**: Implementaciones concretas de los Ports usando librerías nativas
- **ViewModels** (Nivel 2): Manejan el estado de la UI, loading, errores y coordinan con UseCases
- **UseCases** (Nivel 2): Contienen la lógica de negocio pura, orquestan adapters

### Principios

- **Dependencias apuntan hacia el dominio** (Clean Architecture)
- **Separación de capas**: UI → ViewModel → UseCase → Adapter
- **UI limpia**: Los componentes solo renderizan, sin lógica de negocio
- **Casos de negocio aislados**: UseCases testables independientemente
- **Interfaces agnósticas de implementación**
- **Testing sin dependencias nativas**
- **Cambio de librerías sin afectar código de negocio**

---

## Características Principales

### Arquitectura Hexagonal

- Patrón Ports & Adapters implementado completamente
- Separación clara entre lógica de negocio e infraestructura
- Dependencias invertidas (Dependency Inversion Principle)

### Sistema de Módulos

- Organiza tu app en módulos independientes (Auth, Products, Profile, etc.)
- Cada módulo declara sus dependencias explícitamente
- Carga/descarga dinámica de módulos (Hot Reload)

### Inyección de Dependencias

- Container DI con soporte para singletons y factories
- Inferencia automática de tipos de adapters
- Hooks `useAdapter<T>()` y `useUseCase<T>()` para acceso tipado

### ActionBus

- Comunicación inter-módulo sin acoplamiento directo
- Permite que módulos se comuniquen sin conocerse

### Tipado Fuerte

- TypeScript en todo el framework
- Interfaces tipadas para todos los Ports
- Inferencia automática de tipos en adapters

### Casos de Negocio (UseCases)

- Encapsulan la lógica de negocio pura, independiente de la UI
- Reciben adapters inyectados, no dependen de implementaciones concretas
- Altamente testeables sin necesidad de mocks complejos
- Un UseCase = Una responsabilidad de negocio

### ViewModels

- Hook base (`useBaseViewModel`) para manejo automático de loading y errores
- Coordinan entre componentes UI y UseCases
- Mantienen el estado de la UI (loading, error, data)
- Reducen boilerplate en componentes
- Estado consistente en toda la app

---

## Niveles de Integración

Nativefy ofrece **dos niveles de integración** para adaptarse a las necesidades de tu proyecto. Puedes integrarlo hasta el nivel que desees:

### Nivel 1: Solo Abstracción (NativefyProvider)

**Ideal para:** Proyectos existentes que solo quieren abstraer las librerías nativas sin cambiar su arquitectura.

Este nivel te da acceso a los **adapters y ports** (abstracción de implementaciones), pero sin el sistema de módulos ni la inyección de dependencias completa.

#### Arquitectura del Nivel 1

```
┌─────────────────────────────────────────────────────────────┐
│                    TU APLICACIÓN                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Componentes React Native               │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  useAdapter<Port>() → Acceso directo         │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            NativefyProvider (DI + Registry)          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   PORTS     │  │   ERRORS    │  │   DI        │  │    │
│  │  │ (Interfaces)│  │(NativefyErr)│  │ Container  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ▲                                 │
│                            │ implements                      │
│  ┌─────────────────────────┴───────────────────────────┐    │
│  │               @nativefy/*                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │    │
│  │  │http-axios│ │storage-  │ │biometrics│             │    │
│  │  │          │ │mmkv      │ │-rn       │             │    │
│  │  └──────────┘ └──────────┘ └──────────┘             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Incluye: Ports, Errors, DI Container, Adapters
NO incluye: Módulos, UseCases, ViewModels, ActionBus, Navigation
```

#### Flujo del Nivel 1

1. **Core** define las interfaces (Ports) - `HttpClientPort`, `StoragePort`, etc.
2. **Adapters** implementan las interfaces usando librerías específicas
3. **NativefyProvider** registra adapters en el contenedor DI
4. **Componentes UI** usan `useAdapter<Port>()` para acceder directamente a adapters
5. La lógica de negocio puede estar en los componentes o en funciones/hooks personalizados

```typescript
// App.tsx
import { NativefyProvider, useAdapter } from '@nativefy/core';
import { AxiosHttpAdapter } from '@nativefy/http-axios';
import { MMKVStorageAdapter } from '@nativefy/storage-mmkv';
import { HttpClientPort, StoragePort } from '@nativefy/core';

export default function App() {
  return (
    <NativefyProvider
      adapters={{
        http: new AxiosHttpAdapter('https://api.example.com'),
        storage: new MMKVStorageAdapter(),
      }}
    >
      <MyApp />
    </NativefyProvider>
  );
}

// Usar adapters en componentes
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

**Lo que obtienes:**

- Abstracción de librerías nativas (Ports & Adapters)
- Acceso a adapters tipados con `useAdapter<T>()`
- Cambio de implementaciones sin tocar código de negocio
- Testing simplificado con mocks

**Lo que NO incluye:**

- Sistema de módulos
- Inyección de dependencias para UseCases
- Module Registry
- ActionBus
- Navegación integrada

---

### Nivel 2: Framework Completo (NativefyApp)

**Ideal para:** Proyectos nuevos o refactorizaciones que buscan arquitectura completa con módulos, UseCases y ViewModels.

Este nivel incluye **todo el framework**: sistema de módulos, inyección de dependencias, Module Registry, ActionBus y navegación integrada.

#### Arquitectura del Nivel 2

```
┌─────────────────────────────────────────────────────────────┐
│                    TU APLICACIÓN                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Componentes React Native               │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  ViewModels → useBaseViewModel()             │   │    │
│  │  │  useUseCase<T>() → Casos de negocio         │   │    │
│  │  │  useAdapter<T>() → Acceso directo           │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NativefyApp (Framework Completo)      │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  ModuleProvider → Sistema de módulos         │ │    │
│  │  │  ModuleRegistry → Validación dependencias    │ │    │
│  │  │  ActionBus → Comunicación inter-módulo       │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  NativefyProvider (DI + Registry)            │ │    │
│  │  │  ┌─────────────┐  ┌─────────────┐           │ │    │
│  │  │  │   PORTS     │  │   ERRORS    │           │ │    │
│  │  │  │ (Interfaces)│  │(NativefyErr)│           │ │    │
│  │  │  └─────────────┘  └─────────────┘           │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  NavigationContainer + AppNavigator         │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ▲                                 │
│                            │ implements                      │
│  ┌─────────────────────────┴───────────────────────────┐    │
│  │               @nativefy/*                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │    │
│  │  │http-axios│ │storage-  │ │biometrics│ │nav-    │  │    │
│  │  │          │ │mmkv      │ │-rn       │ │react   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Incluye: TODO (Ports, Errors, DI, Adapters, Módulos, UseCases, 
         ViewModels, ActionBus, Navigation, Module Registry)
```

#### Flujo del Nivel 2

1. **Core** define las interfaces (Ports) - `HttpClientPort`, `StoragePort`, etc.
2. **Adapters** implementan las interfaces usando librerías específicas
3. **NativefyProvider** (interno) registra adapters en el contenedor DI
4. **ModuleProvider** carga y valida módulos con sus dependencias
5. **UseCases** encapsulan la lógica de negocio y usan adapters inyectados
6. **ViewModels** coordinan entre UI y UseCases, manejan estado de UI
7. **Componentes UI** consumen ViewModels y permanecen libres de lógica de negocio
8. Los componentes usan `useUseCase<T>()` para casos de negocio y `useAdapter<Port>()` para acceso directo a adapters

```typescript
// App.tsx
import { NativefyApp } from '@nativefy/core';
import { AxiosHttpAdapter } from '@nativefy/http-axios';
import { MMKVStorageAdapter } from '@nativefy/storage-mmkv';
import { createReactNavigationAdapter } from '@nativefy/navigation-react';

// Módulos
import { AuthModule, ProductsModule } from './modules';

const adapters = {
  http: new AxiosHttpAdapter('https://api.example.com'),
  storage: new MMKVStorageAdapter(),
  navigation: createReactNavigationAdapter(),
};

export default function App() {
  return (
    <NativefyApp
      adapters={adapters}
      modules={[AuthModule, ProductsModule]}
      initialModule="auth"
    />
  );
}
```

**Lo que obtienes:**

- Todo lo del Nivel 1
- Sistema de módulos
- Inyección de dependencias completa
- UseCases con `useUseCase<T>()`
- Module Registry (validación de dependencias)
- ActionBus (comunicación inter-módulo)
- Navegación integrada
- Hot Reload de módulos
- ViewModels con `useBaseViewModel()`

---

### Comparación de Niveles

| Característica                      | Nivel 1 (NativefyProvider) | Nivel 2 (NativefyApp) |
| ------------------------------------ | -------------------------- | --------------------- |
| **Abstracción de librerías** | Sí                        | Sí                   |
| **useAdapter `<T>`()**       | Sí                        | Sí                   |
| **Sistema de módulos**        | No                         | Sí                   |
| **useUseCase `<T>`()**       | No                         | Sí                   |
| **Module Registry**            | No                         | Sí                   |
| **ActionBus**                  | No                         | Sí                   |
| **Navegación integrada**      | No                         | Sí                   |
| **Hot Reload módulos**        | No                         | Sí                   |
| **ViewModels**                 | No                         | Sí                   |
| **Complejidad**                | Baja                       | Media-Alta            |
| **Recomendado para**           | Proyectos existentes       | Proyectos nuevos      |

---

## Quick Start

### Instalación

```bash
# Instalar core
pnpm add @nativefy/core @nativefy/ui

# Instalar adapters necesarios
pnpm add @nativefy/http-axios
pnpm add @nativefy/storage-mmkv
pnpm add @nativefy/storage-keychain
pnpm add @nativefy/navigation-react
pnpm add @nativefy/biometrics-rn
pnpm add @nativefy/permissions-rn
pnpm add @nativefy/image-picker-rn
```

### Configuración Básica (Nivel 1 - Solo Abstracción)

Si prefieres solo la abstracción sin el sistema completo:

```typescript
// App.tsx
import { NativefyProvider, useAdapter } from '@nativefy/core';
import { AxiosHttpAdapter } from '@nativefy/http-axios';
import { MMKVStorageAdapter } from '@nativefy/storage-mmkv';
import { HttpClientPort, StoragePort } from '@nativefy/core';

export default function App() {
  return (
    <NativefyProvider
      adapters={{
        http: new AxiosHttpAdapter('https://api.example.com'),
        storage: new MMKVStorageAdapter(),
      }}
    >
      <MyApp />
    </NativefyProvider>
  );
}

// Usar en componentes
function MyComponent() {
  const http = useAdapter<HttpClientPort>('http');
  const storage = useAdapter<StoragePort>('storage');
  
  // Tu lógica aquí
}
```

### Configuración Básica (Nivel 2 - Framework Completo)

```typescript
// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativefyApp } from '@nativefy/core';
import { ThemeProvider } from '@nativefy/ui';

// Adapters
import { AxiosHttpAdapter } from '@nativefy/http-axios';
import { MMKVStorageAdapter } from '@nativefy/storage-mmkv';
import { KeychainStorageAdapter } from '@nativefy/storage-keychain';
import { createReactNavigationAdapter } from '@nativefy/navigation-react';

// Módulos
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
        <NativefyApp
          adapters={adapters}
          modules={[AuthModule, ProductsModule]}
          initialModule="auth"
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

### Crear un Módulo (Solo Nivel 2)

```typescript
// modules/auth/index.ts
import { createModule } from '@nativefy/core';
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

### Crear un ViewModel (Solo Nivel 2)

```typescript
// viewmodels/useLoginViewModel.ts
import { useBaseViewModel, useUseCase, useAdapter, NavigationPort } from '@nativefy/core';
import { useState, useCallback } from 'react';
import { LoginUseCase } from '../usecases/LoginUseCase';

export function useLoginViewModel() {
  // Estado base (loading, error)
  const [baseState, { execute, clearError }] = useBaseViewModel();
  
  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UseCase inyectado (prefijo: moduleId:useCaseKey)
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

### Usar ViewModel en un Componente (UI Limpia)

```typescript
// screens/LoginScreen.tsx
import { View, TextInput, Button, ActivityIndicator } from 'react-native';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export function LoginScreen() {
  // El componente solo consume el ViewModel, sin lógica de negocio
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
        <Button title="Iniciar Sesión" onPress={actions.login} />
      )}
    </View>
  );
}
```

---

## Casos de Uso

### Ideal Para

- **Aplicaciones empresariales** que requieren mantenibilidad a largo plazo
- **Equipos grandes** que necesitan estructura y governance
- **Proyectos complejos** con múltiples módulos/features
- **Apps que requieren testing robusto** (alta cobertura de tests)
- **Proyectos que migran librerías frecuentemente** (ej: cambiar de AsyncStorage a MMKV)
- **Organizaciones que necesitan control** sobre qué capacidades nativas se usan

### No Recomendado Para

- **Prototipos rápidos** (overhead innecesario)
- **Apps muy simples** (una sola pantalla, sin lógica compleja)
- **Equipos de 1-2 personas** (puede ser excesivo)
- **Proyectos con timeline muy corto** (setup inicial toma tiempo)

---

## Capacidades Disponibles

### Implementadas

| Capacidad                  | Adapter                                   | Librería Subyacente                 |
| -------------------------- | ----------------------------------------- | ------------------------------------ |
| **Analytics**        | `@nativefy/analytics-mixpanel`  | mixpanel-react-native                |
| **Biometrics**       | `@nativefy/biometrics-rn`       | react-native-biometrics              |
| **Error Reporting**  | `@nativefy/error-reporting-sentry` | @sentry/react-native            |
| **Feature Flags**    | `@nativefy/feature-flag-growthbook` | @growthbook/growthbook-react   |
| **File System**      | `@nativefy/file-system-rn`      | react-native-blob-util               |
| **Geolocation**      | `@nativefy/geolocation-rn`      | @react-native-community/geolocation  |
| **GraphQL**          | `@nativefy/graphql-apollo`       | @apollo/client                       |
| **HTTP Client**      | `@nativefy/http-axios`          | Axios                                |
| **Image Picker**     | `@nativefy/image-picker-rn`     | react-native-image-picker            |
| **Navigation**       | `@nativefy/navigation-react`    | React Navigation                     |
| **Permissions**      | `@nativefy/permissions-rn`      | react-native-permissions             |
| **Push Notifications** | `@nativefy/push-notification-firebase` | @react-native-firebase/messaging |
| **Push Notifications** | `@nativefy/push-notification-notifee` | @notifee/react-native        |
| **Secure Storage**   | `@nativefy/storage-keychain`    | react-native-keychain                |
| **State Management** | `@nativefy/store-zustand`       | Zustand                              |
| **Storage**          | `@nativefy/storage-async`       | AsyncStorage                         |
| **Storage**          | `@nativefy/storage-mmkv`        | react-native-mmkv (30x más rápido) |

### Planificadas

- Camera/Media (react-native-vision-camera)
- Theme Engine (@shopify/restyle)
- Toast/Alerts (react-native-toast-message)

---

## Comparación con Alternativas

### Nativefy vs Expo

| Aspecto                | Expo                     | Nativefy                  |
| ---------------------- | ------------------------ | ------------------------- |
| **Propósito**   | Plataforma de desarrollo | Framework de arquitectura |
| **Setup**        | Muy rápido              | Más lento                |
| **Flexibilidad** | Limitada (managed)       | Alta                      |
| **Testing**      | Estándar                | Más fácil               |
| **Arquitectura** | No impone                | Hexagonal                 |
| **Build System** | EAS Build                | Manual                    |

**Recomendación**: Usar **Expo para tooling** (EAS Build, Updates) + **Nativefy para arquitectura**.

### Nativefy vs React Native Puro

| Aspecto                            | RN Puro                    | Nativefy                     |
| ---------------------------------- | -------------------------- | ---------------------------- |
| **Testing**                  | Difícil (mocks complejos) | Fácil (adapters mockeables) |
| **Mantenibilidad**           | Depende del equipo         | Estructura clara             |
| **Migración de librerías** | Buscar/reemplazar todo     | Cambiar adapter              |
| **Onboarding**               | Depende del proyecto       | Arquitectura documentada     |
| **Governance**               | Manual                     | Interfaces tipadas           |

---

## Documentación

- **[Core Package](./packages/core/README.md)** - Arquitectura, módulos, DI
- **[UI Package](./packages/ui/README.md)** - Componentes reutilizables
- **[Adapters](./packages/adapters/)** - Documentación de cada adapter
- **[Examples App](./apps/examples/)** - App de demostración completa

### Guías

Consulta la documentación en [`.cursorrules`](.cursorrules) para:

- Cómo crear un Port
- Cómo crear un Adapter
- Cómo crear un Módulo
- Testing con Nativefy

---

## Stack Tecnológico

| Herramienta            | Versión | Propósito                   |
| ---------------------- | -------- | ---------------------------- |
| **pnpm**         | 10.24.0  | Package manager (workspaces) |
| **Turbo**        | 2.6.2    | Build system monorepo        |
| **TypeScript**   | 5.9.3    | Tipado estático             |
| **React Native** | 0.82+    | Framework móvil             |
| **React**        | 19.1.1   | UI library                   |

---

## Ejemplo Completo

Ver la app de ejemplos completa en [`apps/examples/`](./apps/examples/) que incluye:

- Módulo de Autenticación (Login, Registro)
- Módulo de Productos (Lista, Detalle)
- Módulo de Perfil (Configuración, Biometría, Permisos)
- Integración de todos los adapters
- ViewModels con `useBaseViewModel`
- UseCases con inyección de dependencias
- Navegación entre módulos

```bash
# Ejecutar app de ejemplos
cd apps/examples
pnpm install
pnpm ios    # o pnpm android
```

---

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

Consulta [`.cursorrules`](.cursorrules) para:

- Cómo crear un nuevo Adapter
- Cómo crear un nuevo Port
- Convenciones de código y arquitectura

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## Soporte

- [Documentación Completa](./packages/core/README.md)
- [App de Ejemplos](./apps/examples/)
- [Reportar Issues](https://github.com/tu-usuario/nativefy-framework/issues)

---

## Aprende Más

### Conceptos Clave

- **Arquitectura Hexagonal** - Ver sección de arquitectura en este README
- **Ports & Adapters** - Interfaces definidas en `packages/core/src/ports/`
- **Sistema de Módulos** - Ver `packages/core/src/module/`
- **Inyección de Dependencias** - Ver `packages/core/src/di/`

### Ejemplos Prácticos

- Ver [`apps/examples/`](./apps/examples/) para una app completa
- Cada adapter tiene su propio README con ejemplos en `packages/adapters/*/README.md`
- Consulta [`.cursorrules`](.cursorrules) para guías detalladas

---

## Roadmap

### Próximas Capacidades

- **Camera/Media** - react-native-vision-camera
- **Location** - react-native-geolocation-service
- **File System** - react-native-blob-util
- **Theme Engine** - @shopify/restyle
- **Toast/Alerts** - react-native-toast-message
- **Crash Reporting** - Sentry integration
- **Validation** - Zod schemas

### Mejoras Planificadas

- Hot Reload mejorado para módulos
- Métricas y telemetría
- Testing utilities mejoradas
- Generadores de código (CLI)

---

## Compatibilidad

### React Native

- **0.82+** (Recomendado)
- Compatible con Expo (usando adapters de Expo)
- Compatible con bare React Native

### TypeScript

- **5.9+** (Recomendado)
- Tipado completo en todo el framework

---

<div align="center">

**Hecho para la comunidad de React Native**

**Star este repo** si te resulta útil

[Documentación](./packages/core/README.md) • [Ejemplos](./apps/examples/) • [Issues](https://github.com/tu-usuario/nativefy-framework/issues)

</div>
