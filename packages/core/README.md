# @natify/core

Núcleo del framework Natify. Proporciona la arquitectura hexagonal, sistema de módulos, inyección de dependencias y herramientas para construir aplicaciones React Native desacopladas.

## Instalación

```bash
pnpm add @natify/core
```

## Características

- **Arquitectura Hexagonal** - Ports & Adapters pattern
- **Sistema de Módulos** - Organiza tu app en mini-apps independientes
- **Inyección de Dependencias** - Container DI con singletons y factories
- **ActionBus** - Comunicación inter-módulo estilo MediatR
- **Tipos Genéricos** - Inferencia automática de tipos de adapters
- **Hot Reload** - Carga/descarga dinámica de módulos
- **Adapters Incluidos** - Logger y Analytics por defecto

---

## Arquitectura de Capas (Recomendada)

Natify recomienda seguir Clean Architecture con separación de capas, pero **es flexible y puedes usarlo sin ViewModels** si prefieres un enfoque más simple.

### Arquitectura Recomendada

```
┌─────────────────────────────────────┐
│         UI Layer (Vistas)           │  ← Componentes React Native puros
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      ViewModels (Estado UI)         │  ← Manejan loading, errores, estado
│         [OPCIONAL]                   │  ← Puedes omitir esta capa
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    UseCases (Lógica de Negocio)     │  ← Casos de uso puros, testeables
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Ports (Interfaces)             │  ← Contratos sin implementación
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Adapters (Implementaciones)      │  ← Librerías nativas concretas
└─────────────────────────────────────┘
```

**Principios:**
- **Dependencias apuntan hacia el dominio** - Las capas externas dependen de las internas
- **UI limpia** - Los componentes solo renderizan, sin lógica de negocio
- **UseCases aislados** - Lógica de negocio independiente de frameworks
- **Interfaces agnósticas** - Los Ports no conocen implementaciones

### Uso con ViewModels (Recomendado)

```typescript
// ViewModel maneja estado y coordina con UseCase
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

// Componente limpio, solo renderiza
function LoginScreen() {
  const { state, actions } = useLoginViewModel();
  return <Button onPress={() => actions.login(email, password)} />;
}
```

### Uso sin ViewModels (También válido)

Puedes usar Natify directamente en componentes si prefieres un enfoque más simple:

```typescript
// Componente que usa UseCase directamente
function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await loginUseCase.execute({ email, password });
    } catch (error) {
      // Manejar error
    } finally {
      setIsLoading(false);
    }
  };

  return <Button onPress={handleLogin} disabled={isLoading} />;
}
```

**Nota:** Los ViewModels son **opcionales** pero recomendados para:
- Aplicaciones complejas con múltiples estados
- Equipos que buscan separación clara de responsabilidades
- Proyectos que requieren testing exhaustivo de lógica de UI

Para prototipos rápidos o apps simples, puedes usar UseCases directamente en componentes.

---

## Guía Rápida

### 1. Configurar Adapters

```typescript
import { NatifyApp, ConsoleLoggerAdapter } from "@natify/core";
import { AxiosHttpAdapter } from "@natify/http-axios";
import { MMKVStorageAdapter } from "@natify/storage-mmkv";
import { createReactNavigationAdapter } from "@natify/navigation-react";

const adapters = {
  http: new AxiosHttpAdapter("https://api.example.com"),
  storage: new MMKVStorageAdapter(),
  navigation: createReactNavigationAdapter(),
  // Logger es opcional, se usa ConsoleLoggerAdapter por defecto si no se proporciona
  logger: new ConsoleLoggerAdapter(),
};
```

### 2. Crear Módulos

```typescript
import { createModule } from "@natify/core";

export const AuthModule = createModule("auth", "Authentication")
  .requires("http", "storage", "navigation")
  .screen({ name: "Login", component: LoginScreen })
  .useCase("login", (adapters) => new LoginUseCase(adapters.http, adapters.storage))
  .initialRoute("Login")
  .build();
```

### 3. Configurar App

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

## Adapters Incluidos en el Core

### ConsoleLoggerAdapter

Adapter de logging que usa `console` para escribir logs. Se usa automáticamente si no proporcionas un logger en la configuración.

```typescript
import { ConsoleLoggerAdapter } from "@natify/core";

const logger = new ConsoleLoggerAdapter();

// Usar directamente
logger.info("Usuario autenticado", { userId: "123" });
logger.error("Error al cargar datos", error);

// O inyectarlo en adapters
const adapters = {
  logger: new ConsoleLoggerAdapter(),
  // ... otros adapters
};
```

**Niveles de log disponibles:**
- `logger.debug(message, metadata?)`
- `logger.info(message, metadata?)`
- `logger.warn(message, metadata?)`
- `logger.error(message, error?, metadata?)`

### CompositeAnalyticsAdapter

Adapter de analytics que permite combinar múltiples proveedores de analytics en uno solo. Útil cuando necesitas enviar eventos a múltiples servicios simultáneamente.

```typescript
import { CompositeAnalyticsAdapter } from "@natify/core";
import { FirebaseAnalyticsAdapter } from "@natify/analytics-firebase";
import { MixpanelAnalyticsAdapter } from "@natify/analytics-mixpanel";

// Crear adapters individuales
const firebase = new FirebaseAnalyticsAdapter();
const mixpanel = new MixpanelAnalyticsAdapter();

// Combinarlos en un solo adapter
const analytics = new CompositeAnalyticsAdapter([firebase, mixpanel]);

// Inicializar todos
await analytics.init();

// Los eventos se envían a todos los adapters
analytics.track("user_login", { method: "email" });
// ↑ Se envía tanto a Firebase como a Mixpanel
```

**Métodos disponibles:**
- `analytics.init()` - Inicializa todos los adapters
- `analytics.identify(userId, traits?)` - Identifica un usuario
- `analytics.track(event, properties?)` - Registra un evento
- `analytics.screen(name, properties?)` - Registra una pantalla
- `analytics.reset()` - Resetea todos los adapters

---

## useAdapter vs useUseCase

### `useAdapter<T>(name)` - Acceso directo a adapters

Usa `useAdapter` cuando necesites acceso directo a un adapter del framework, típicamente para:

- **Navegación** (`navigation`)
- **Logging** (`logger`)
- **Operaciones simples** sin lógica de negocio

```typescript
import { useAdapter, NavigationPort, LoggerPort } from "@natify/core";

function MyComponent() {
  const navigation = useAdapter<NavigationPort>("navigation");
  const logger = useAdapter<LoggerPort>("logger");

  const handlePress = () => {
    logger.info("Navegando a detalle de producto");
    navigation.navigate("products/ProductDetail", { id: "123" });
  };
}
```

### `useUseCase<T>(key)` - Lógica de negocio encapsulada

Usa `useUseCase` cuando la operación involucra lógica de negocio, como:

- **Login/Logout**
- **Operaciones CRUD**
- **Validaciones complejas**

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

### Regla General

| Situación | Hook a usar |
|-----------|-------------|
| Navegación simple | `useAdapter<NavigationPort>` |
| Logging | `useAdapter<LoggerPort>` |
| Lógica de negocio | `useUseCase<MiUseCase>` |
| Operaciones triviales (guardar setting) | `useAdapter` está bien |

---

## ActionBus - Comunicación Inter-Módulo

El ActionBus permite que los módulos se comuniquen sin acoplarse directamente.

### Registrar Handler (en el módulo que provee la acción)

```typescript
import { actionBus } from "@natify/core";

// En AuthModule
export const AuthModule = createModule("auth", "Authentication")
  .onInit(async (adapters) => {
    actionBus.register("auth:logout", async () => {
      await logoutUseCase.execute();
    });
  })
  .build();
```

### Despachar Acción (desde cualquier módulo)

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

## Hot Reload de Módulos

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

## Hooks de Navegación

```typescript
import { useNavigationParams, useCurrentRoute, useAdapter, NavigationPort } from "@natify/core";

function ProductDetail() {
  // Obtener parámetros tipados
  const { productId } = useNavigationParams<{ productId: string }>();

  // Navegación usando el adapter directamente
  const navigation = useAdapter<NavigationPort>("navigation");

  // Ruta actual
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

Hook base para ViewModels con manejo de loading y errores:

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
      // Éxito
    }
  };

  return {
    state, // { isLoading, error }
    actions: { login, clearError },
  };
}
```

**Estado del BaseViewModel:**
- `state.isLoading` - Indica si hay una operación en curso
- `state.error` - Error de la última operación (si existe)
- `execute(fn)` - Ejecuta una función async y maneja loading/error automáticamente
- `clearError()` - Limpia el error actual

---

## Ports Disponibles

El core define las siguientes interfaces (Ports) que deben ser implementadas por adapters:

- `HttpClientPort` - Cliente HTTP para peticiones REST
- `StoragePort` - Almacenamiento local (key-value)
- `NavigationPort` - Navegación entre pantallas
- `BiometricPort` - Autenticación biométrica
- `PermissionPort` - Gestión de permisos del dispositivo
- `ImagePickerPort` - Selección de imágenes desde galería o cámara
- `LoggerPort` - Sistema de logging
- `AnalyticsPort` - Tracking de eventos y analytics
- `StateManagerPort` - Gestión de estado global
- `GraphQLPort` - Cliente GraphQL (opcional)

Cada Port define un contrato que los adapters deben cumplir, permitiendo intercambiar implementaciones sin cambiar el código de negocio.

---

## Sistema de Errores

Natify proporciona un sistema de errores tipado y consistente:

```typescript
import { NatifyError, NatifyErrorCode } from "@natify/core";

// Crear un error tipado
throw new NatifyError(
  NatifyErrorCode.NETWORK_ERROR,
  "No se pudo conectar al servidor",
  originalError,
  { url: "/api/users", retries: 3 }
);

// Manejar errores
try {
  await http.get("/users");
} catch (error) {
  if (error instanceof NatifyError) {
    switch (error.code) {
      case NatifyErrorCode.UNAUTHORIZED:
        // Redirigir a login
        break;
      case NatifyErrorCode.NETWORK_ERROR:
        // Mostrar mensaje de sin conexión
        break;
    }
  }
}
```

**Códigos de error disponibles:**
- `NETWORK_ERROR` - Error de red genérico
- `TIMEOUT` - Timeout de petición
- `UNAUTHORIZED` - HTTP 401
- `FORBIDDEN` - HTTP 403
- `NOT_FOUND` - HTTP 404
- `SERVER_ERROR` - HTTP 500+
- `STORAGE_READ_ERROR` - Error leyendo storage
- `STORAGE_WRITE_ERROR` - Error escribiendo storage
- `VALIDATION_ERROR` - Error de validación
- `UNKNOWN` - Error desconocido

---

## Exports Principales

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

// Adapters (incluidos en el core)
export { ConsoleLoggerAdapter, CompositeAnalyticsAdapter }
```

---

## Testing

Natify facilita el testing mediante inyección de dependencias:

```typescript
// Mock de un adapter
const mockStorage = {
  getItem: jest.fn().mockResolvedValue("token"),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  capability: "storage" as const,
};

// Testear un UseCase sin dependencias nativas
const loginUseCase = new LoginUseCase(mockStorage);
const result = await loginUseCase.execute({ email: "test@example.com", password: "123" });

expect(mockStorage.setItem).toHaveBeenCalledWith("auth_token", expect.any(String));
```

---

## Más Información

- [README Principal](../README.md) - Documentación completa del framework
- [Ejemplos de Uso](../../apps/examples/) - App de demostración completa
- [Guías de Desarrollo](../../.cursorrules) - Convenciones y mejores prácticas
