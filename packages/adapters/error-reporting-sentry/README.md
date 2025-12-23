# @nativefy-adapter/error-reporting-sentry

Adapter de Error Reporting para Nativefy Framework usando Sentry.

## Instalación

```bash
pnpm add @nativefy-adapter/error-reporting-sentry @sentry/react-native
```

### Configuración Automática

Sentry proporciona un wizard para configurar automáticamente el proyecto:

```bash
npx @sentry/wizard@latest -i reactNative
```

Este comando:
- Instala las dependencias necesarias
- Configura iOS (CocoaPods)
- Configura Android
- Crea archivos de configuración

### Configuración Manual

#### iOS

```bash
cd ios && pod install && cd ..
```

#### Android

No requiere configuración adicional después de ejecutar el wizard.

## Configuración

### Obtener DSN de Sentry

1. Crea una cuenta en [Sentry](https://sentry.io)
2. Crea un nuevo proyecto (React Native)
3. Copia el **DSN** desde Settings → Client Keys (DSN)

## Uso

### Configuración Básica

```typescript
import { NativefyProvider } from "@nativefy/core";
import { SentryErrorReportingAdapter } from "@nativefy-adapter/error-reporting-sentry";

const errorReporting = new SentryErrorReportingAdapter({
  dsn: "YOUR_SENTRY_DSN",
  environment: __DEV__ ? "development" : "production",
  release: "1.0.0",
});

// Inicializar
await errorReporting.init();

const config = {
  errorReporting: errorReporting,
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

### Configuración Avanzada

```typescript
const errorReporting = new SentryErrorReportingAdapter({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  release: "1.0.0",
  debug: false, // Habilitar logs de debug
  enableTracing: true, // Performance monitoring
  tracesSampleRate: 0.1, // 10% de las transacciones
  attachScreenshot: true, // Capturar screenshots en errores
  attachViewHierarchy: true, // Capturar view hierarchy
});
```

## Capturar Errores

### Capturar Excepción

```typescript
import { useAdapter, ErrorReportingPort, SeverityLevel } from "@nativefy/core";

function MyComponent() {
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");

  const handleError = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      // Capturar error con contexto
      errorReporting.captureException(error as Error, {
        screen: "ProductDetail",
        productId: "123",
        action: "purchase",
      });
    }
  };
}
```

### Capturar Mensaje

```typescript
// Mensaje informativo
errorReporting.captureMessage("User completed checkout", SeverityLevel.INFO, {
  orderId: "123",
  total: 99.99,
});

// Advertencia
errorReporting.captureMessage("API response time is slow", SeverityLevel.WARNING, {
  endpoint: "/api/products",
  responseTime: 5000,
});

// Error crítico
errorReporting.captureMessage("Payment gateway unavailable", SeverityLevel.ERROR, {
  gateway: "stripe",
  retryCount: 3,
});
```

### Con NativefyError

```typescript
import { NativefyError, NativefyErrorCode } from "@nativefy/core";

try {
  await operation();
} catch (error) {
  if (error instanceof NativefyError) {
    errorReporting.captureException(error, {
      errorCode: error.code,
      context: error.context,
    });
  } else {
    errorReporting.captureException(error as Error);
  }
}
```

## Contexto de Usuario

### Establecer Usuario

```typescript
import { useAdapter, ErrorReportingPort } from "@nativefy/core";

function useAuth() {
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");

  const login = async (user: User) => {
    // Establecer contexto del usuario
    errorReporting.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      plan: user.plan,
      roles: user.roles,
    });
  };

  const logout = async () => {
    // Limpiar contexto
    errorReporting.clearUser();
  };

  return { login, logout };
}
```

### Obtener Usuario Actual

```typescript
const currentUser = errorReporting.getUser();
if (currentUser) {
  console.log("Current user:", currentUser.id);
}
```

## Breadcrumbs

### Agregar Breadcrumbs

```typescript
// Antes de una operación crítica
errorReporting.addBreadcrumb({
  message: "User clicked checkout button",
  category: "user-action",
  level: SeverityLevel.INFO,
  data: {
    screen: "Cart",
    itemsCount: 3,
  },
});

// Durante una operación
errorReporting.addBreadcrumb({
  message: "Calling payment API",
  category: "api",
  level: SeverityLevel.INFO,
  data: {
    endpoint: "/api/payment",
    method: "POST",
  },
});

// Si hay un error, los breadcrumbs ayudan a entender qué pasó antes
try {
  await processPayment();
} catch (error) {
  errorReporting.captureException(error as Error);
  // Los breadcrumbs anteriores se incluyen automáticamente
}
```

### Breadcrumbs Automáticos

Los breadcrumbs se agregan automáticamente para:
- Navegación entre pantallas
- Llamadas HTTP (si está configurado)
- Interacciones del usuario (clicks, etc.)

## Tags y Contexto

### Establecer Tags

```typescript
// Tags para filtrar errores en el dashboard
errorReporting.setTags({
  app_version: "1.0.0",
  platform: Platform.OS,
  build_number: "123",
  feature: "checkout",
});

// Tag individual
errorReporting.setTag("user_plan", "premium");
```

### Establecer Contexto

```typescript
// Contexto de la aplicación
errorReporting.setContext("app", {
  version: "1.0.0",
  build: "123",
  environment: "production",
});

// Contexto de dispositivo
errorReporting.setContext("device", {
  model: Device.modelName,
  os: Platform.OS,
  osVersion: Platform.Version,
});

// Contexto de navegación
errorReporting.setContext("navigation", {
  currentScreen: "ProductDetail",
  previousScreen: "ProductList",
  stackDepth: 3,
});
```

## Casos de Uso Comunes

### Error Boundary Global

```typescript
import { ErrorBoundary } from "@sentry/react-native";
import { NativefyProvider } from "@nativefy/core";

function App() {
  const errorReporting = new SentryErrorReportingAdapter({
    dsn: "YOUR_SENTRY_DSN",
  });

  await errorReporting.init();

  return (
    <ErrorBoundary>
      <NativefyProvider config={{ errorReporting, ...otherAdapters }}>
        <MyApp />
      </NativefyProvider>
    </ErrorBoundary>
  );
}
```

### Capturar Errores en UseCase

```typescript
import { ErrorReportingPort, HttpClientPort } from "@nativefy/core";

export class PurchaseProductUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly errorReporting: ErrorReportingPort
  ) {}

  async execute(productId: string): Promise<void> {
    // Agregar breadcrumb antes de la operación
    this.errorReporting.addBreadcrumb({
      message: "Starting purchase",
      category: "business-logic",
      data: { productId },
    });

    try {
      const response = await this.http.post("/purchase", { productId });

      this.errorReporting.addBreadcrumb({
        message: "Purchase successful",
        category: "business-logic",
        data: { orderId: response.data.orderId },
      });
    } catch (error) {
      // Capturar error con contexto completo
      this.errorReporting.captureException(error as Error, {
        useCase: "PurchaseProduct",
        productId,
        step: "api-call",
      });
      throw error;
    }
  }
}
```

### Tracking de Performance

```typescript
const trackPerformance = async (operation: string, fn: () => Promise<void>) => {
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");
  const startTime = Date.now();

  try {
    await fn();
    const duration = Date.now() - startTime;

    // Si es muy lento, reportar como warning
    if (duration > 5000) {
      errorReporting.captureMessage(
        `Slow operation: ${operation}`,
        SeverityLevel.WARNING,
        {
          operation,
          duration_ms: duration,
        }
      );
    }
  } catch (error) {
    errorReporting.captureException(error as Error, {
      operation,
      duration_ms: Date.now() - startTime,
    });
  }
};
```

### Integración con BaseViewModel

```typescript
import { useBaseViewModel } from "@nativefy/core";
import { useAdapter, ErrorReportingPort } from "@nativefy/core";

function useMyViewModel() {
  const [baseState, { execute }] = useBaseViewModel();
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");

  const loadData = useCallback(async () => {
    const result = await execute(async () => {
      // Si hay error, BaseViewModel lo captura
      // Pero podemos agregar contexto adicional
      try {
        return await fetchData();
      } catch (error) {
        errorReporting.captureException(error as Error, {
          screen: "MyScreen",
          action: "loadData",
        });
        throw error;
      }
    });
  }, [execute, errorReporting]);

  return { state: baseState, actions: { loadData } };
}
```

### Capturar Errores de Red

```typescript
import { NativefyError, NativefyErrorCode } from "@nativefy/core";

// En un interceptor HTTP
const httpAdapter = new AxiosHttpAdapter("https://api.example.com", {}, {
  onResponseError: async (error) => {
    if (error.response?.status >= 500) {
      // Capturar errores del servidor
      errorReporting.captureException(error, {
        endpoint: error.config?.url,
        status: error.response?.status,
        method: error.config?.method,
      });
    }
    return Promise.reject(error);
  },
});
```

## Integración con Módulos

```typescript
import { createModule } from "@nativefy/core";
import { PurchaseProductUseCase } from "./usecases/PurchaseProductUseCase";

export const ProductsModule = createModule("products", "Products")
  .requires("error-reporting", "http")
  .useCase("purchaseProduct", (adapters) => {
    return new PurchaseProductUseCase(adapters.http, adapters.errorReporting);
  })
  .build();
```

## API

### ErrorReportingPort

| Método | Descripción |
|--------|-------------|
| `init(dsn?, options?)` | Inicializa el servicio |
| `captureException(error, context?, level?)` | Captura una excepción |
| `captureMessage(message, level?, context?)` | Captura un mensaje |
| `setUser(user)` | Establece contexto del usuario |
| `getUser()` | Obtiene contexto del usuario |
| `addBreadcrumb(breadcrumb)` | Agrega breadcrumb |
| `setTags(tags)` | Establece tags |
| `setTag(key, value)` | Establece un tag |
| `setContext(key, context)` | Establece contexto |
| `clearUser()` | Limpia contexto del usuario |
| `clearBreadcrumbs()` | Limpia breadcrumbs |

### SeverityLevel

```typescript
enum SeverityLevel {
  FATAL = 'fatal',    // Error crítico que causa crash
  ERROR = 'error',    // Error que necesita atención
  WARNING = 'warning', // Advertencia
  INFO = 'info',      // Información
  DEBUG = 'debug',    // Debug
}
```

### UserContext

```typescript
interface UserContext {
  id: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}
```

### Breadcrumb

```typescript
interface Breadcrumb {
  message: string;
  category?: string;
  level?: SeverityLevel;
  data?: Record<string, unknown>;
  timestamp?: Date;
}
```

## Mejores Prácticas

### No Capturar Información Sensible

❌ **Evitar:**
```typescript
errorReporting.captureException(error, {
  password: userPassword, // ❌ NUNCA
  credit_card: cardNumber, // ❌ NUNCA
  ssn: userSSN, // ❌ NUNCA
});
```

✅ **Usar:**
```typescript
errorReporting.captureException(error, {
  user_id: userId, // ✅ OK
  action: "checkout", // ✅ OK
  screen: "Payment", // ✅ OK
});
```

### Agregar Contexto Relevante

```typescript
// Siempre incluir contexto útil
errorReporting.captureException(error, {
  screen: currentScreen,
  action: "purchase",
  productId: productId,
  userId: currentUserId,
  appVersion: "1.0.0",
});
```

### Usar Breadcrumbs para Debugging

```typescript
// Agregar breadcrumbs antes de operaciones críticas
errorReporting.addBreadcrumb({
  message: "User entered payment details",
  category: "user-flow",
  data: { screen: "Payment" },
});

errorReporting.addBreadcrumb({
  message: "Validating payment",
  category: "business-logic",
});

// Si hay error, verás todo el flujo en Sentry
```

### Establecer Usuario Después del Login

```typescript
// Inmediatamente después de login exitoso
errorReporting.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

## Notas

- **Inicialización**: Siempre llama `init()` antes de usar el adapter
- **DSN**: Obtén el DSN desde el dashboard de Sentry
- **Environment**: Usa diferentes DSNs o environments para dev/staging/prod
- **Release**: Establece la versión para tracking de releases
- **Performance**: Habilita `enableTracing` para performance monitoring
- **Screenshots**: `attachScreenshot` captura screenshots automáticamente en errores
- **iOS**: Requiere `pod install` después de instalar
- **Android**: El wizard configura automáticamente

