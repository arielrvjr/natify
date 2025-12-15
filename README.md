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
// ❌ Código acoplado - difícil de testear y cambiar
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

// Si quieres cambiar a MMKV, debes buscar y reemplazar en TODO el código
await AsyncStorage.setItem('token', token);
```

Con Nativefy, usas **interfaces** y cambias implementaciones sin tocar tu código:

```typescript
// ✅ Código desacoplado - fácil de testear y cambiar
const storage = useAdapter<StoragePort>('storage');
await storage.setItem('token', token);

// Cambiar de AsyncStorage a MMKV es solo cambiar el adapter en App.tsx
```

---

## ¿Por qué Nativefy?

### Para Equipos y Proyectos

| Escenario | Beneficio |
|----------|-----------|
| **Equipos grandes (3+ devs)** | Arquitectura clara, fácil onboarding |
| **Proyectos a largo plazo** | Mantenibilidad y escalabilidad |
| **Apps empresariales** | Governance y control sobre capacidades |
| **Testing robusto** | Mocks fáciles, tests aislados |
| **Migración de librerías** | Cambiar implementaciones sin romper código |

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

- **Sistema de módulos**: Organiza tu app en mini-apps independientes
- **Casos de negocio (UseCases)**: Lógica de negocio encapsulada y testeable
- **ViewModels**: Separación clara entre UI y lógica, UI limpia y mantenible
- **Inyección de dependencias**: Gestión automática de dependencias
- **ActionBus**: Comunicación inter-módulo sin acoplamiento

---

## Arquitectura

Nativefy sigue el patrón **Hexagonal (Ports & Adapters)** combinado con **Clean Architecture**, separando la aplicación en capas bien definidas:

- **UI Layer (Vistas)**: Componentes React Native puros, sin lógica de negocio
- **ViewModels**: Manejan el estado de la UI, loading, errores y coordinan con UseCases
- **UseCases (Casos de Negocio)**: Contienen la lógica de negocio pura, orquestan adapters
- **Ports (Interfaces)**: Contratos que definen capacidades sin implementación
- **Adapters**: Implementaciones concretas de los Ports usando librerías nativas

```
┌─────────────────────────────────────────────────────────────┐
│                        APLICACIÓN                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    @nativefy/core                    │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   PORTS     │  │   ERRORS    │  │  PROVIDER   │  │    │
│  │  │ (Interfaces)│  │(NativefyErr)│  │  (Context)  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ▲                                 │
│                            │ implements                      │
│  ┌─────────────────────────┴───────────────────────────┐    │
│  │               @nativefy-adapter/*                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │    │
│  │  │http-axios│ │storage-  │ │biometrics│ │store-  │  │    │
│  │  │          │ │mmkv      │ │-rn       │ │zustand │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Dependencias y Capas

1. **Core** define las interfaces (Ports) - `HttpClientPort`, `StoragePort`, etc.
2. **Adapters** implementan las interfaces usando librerías específicas
3. **UseCases** encapsulan la lógica de negocio y usan adapters inyectados
4. **ViewModels** coordinan entre UI y UseCases, manejan estado de UI
5. **Componentes UI** consumen ViewModels y permanecen libres de lógica de negocio
6. Los componentes usan `useUseCase<T>()` para casos de negocio y `useAdapter<Port>()` para acceso directo a adapters

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
- Patrón similar a MediatR (C#) o Command Bus
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

## Quick Start

### Instalación

```bash
# Instalar core
pnpm add @nativefy/core @nativefy/ui

# Instalar adapters necesarios
pnpm add @nativefy-adapter/http-axios
pnpm add @nativefy-adapter/storage-mmkv
pnpm add @nativefy-adapter/storage-keychain
pnpm add @nativefy-adapter/navigation-react
pnpm add @nativefy-adapter/biometrics-rn
pnpm add @nativefy-adapter/permissions-rn
pnpm add @nativefy-adapter/image-picker-rn
```

### Configuración Básica

```typescript
// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativefyApp } from '@nativefy/core';
import { ThemeProvider } from '@nativefy/ui';

// Adapters
import { AxiosHttpAdapter } from '@nativefy-adapter/http-axios';
import { MMKVStorageAdapter } from '@nativefy-adapter/storage-mmkv';
import { KeychainStorageAdapter } from '@nativefy-adapter/storage-keychain';
import { createReactNavigationAdapter } from '@nativefy-adapter/navigation-react';

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

### Crear un Módulo

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

### Crear un ViewModel

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

| Capacidad | Adapter | Librería Subyacente |
|-----------|---------|---------------------|
| **HTTP Client** | `@nativefy-adapter/http-axios` | Axios |
| **Storage** | `@nativefy-adapter/storage-mmkv` | react-native-mmkv (30x más rápido) |
| **Storage** | `@nativefy-adapter/storage-async` | AsyncStorage |
| **Secure Storage** | `@nativefy-adapter/storage-keychain` | react-native-keychain |
| **Biometrics** | `@nativefy-adapter/biometrics-rn` | react-native-biometrics |
| **Permissions** | `@nativefy-adapter/permissions-rn` | react-native-permissions |
| **Navigation** | `@nativefy-adapter/navigation-react` | React Navigation |
| **Image Picker** | `@nativefy-adapter/image-picker-rn` | react-native-image-picker |
| **State Management** | `@nativefy-adapter/store-zustand` | Zustand |
| **Analytics** | `@nativefy-adapter/analytics-composite` | Composite (múltiples providers) |

### Planificadas

- Camera/Media (react-native-vision-camera)
- Location (react-native-geolocation-service)
- File System (react-native-blob-util)
- Theme Engine (@shopify/restyle)
- Toast/Alerts (react-native-toast-message)
- Crash Reporting (Sentry)
- Validation (Zod)

---

## Comparación con Alternativas

### Nativefy vs Expo

| Aspecto | Expo | Nativefy | Combinación |
|---------|------|----------|-------------|
| **Propósito** | Plataforma de desarrollo | Framework de arquitectura | Compatible |
| **Setup** | Muy rápido | Más lento | Expo + Nativefy |
| **Flexibilidad** | Limitada (managed) | Alta | Nativefy gana |
| **Testing** | Estándar | Más fácil | Nativefy gana |
| **Arquitectura** | No impone | Hexagonal | Nativefy gana |
| **Build System** | EAS Build | Manual | Expo gana |

**Recomendación**: Usar **Expo para tooling** (EAS Build, Updates) + **Nativefy para arquitectura**.

### Nativefy vs React Native Puro

| Aspecto | RN Puro | Nativefy |
|---------|---------|----------|
| **Testing** | Difícil (mocks complejos) | Fácil (adapters mockeables) |
| **Mantenibilidad** | Depende del equipo | Estructura clara |
| **Migración de librerías** | Buscar/reemplazar todo | Cambiar adapter |
| **Onboarding** | Depende del proyecto | Arquitectura documentada |
| **Governance** | Manual | Interfaces tipadas |

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

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **pnpm** | 10.24.0 | Package manager (workspaces) |
| **Turbo** | 2.6.2 | Build system monorepo |
| **TypeScript** | 5.9.3 | Tipado estático |
| **React Native** | 0.82+ | Framework móvil |
| **React** | 19.1.1 | UI library |

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

## Agradecimientos

- Inspirado en arquitectura hexagonal y Clean Architecture
- Patrones similares a MediatR (C#) y Command Bus
- Comunidad de React Native por las excelentes librerías

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
