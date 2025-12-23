# @nativefy/feature-flag-growthbook

Adapter de Feature Flags para Nativefy Framework usando GrowthBook.

## Instalación

```bash
pnpm add @nativefy/feature-flag-growthbook @growthbook/growthbook-react
```

### Para Streaming en Tiempo Real (Opcional)

Si quieres habilitar actualizaciones en tiempo real de feature flags:

```bash
pnpm add react-native-sse
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No requiere configuración adicional.

## Configuración

### Obtener Client Key de GrowthBook

1. Crea una cuenta en [GrowthBook](https://www.growthbook.io)
2. Crea un nuevo proyecto
3. Copia el **Client Key** desde Settings → API Keys

## Uso

### Configuración Básica

```typescript
import { NativefyProvider } from "@nativefy/core";
import { GrowthBookFeatureFlagAdapter } from "@nativefy/feature-flag-growthbook";

const featureFlags = new GrowthBookFeatureFlagAdapter({
  clientKey: "YOUR_GROWTHBOOK_CLIENT_KEY",
});

const config = {
  featureflags: featureFlags,
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
const featureFlags = new GrowthBookFeatureFlagAdapter({
  clientKey: "YOUR_GROWTHBOOK_CLIENT_KEY",
  apiHost: "https://cdn.growthbook.io", // Opcional
  enableDevMode: true, // Para desarrollo
  enableStreaming: true, // Actualizaciones en tiempo real
  enableRemoteEval: false, // Evaluación remota (requiere servidor proxy)
  initialAttributes: {
    id: currentUserId,
    email: userEmail,
    plan: "premium",
  },
});

// Inicializar
await featureFlags.init();
```

### Con Streaming (Actualizaciones en Tiempo Real)

```typescript
import { setPolyfills } from "@growthbook/growthbook";
import EventSource from "react-native-sse";

// Configurar polyfill para SSE en React Native
setPolyfills({
  EventSource: EventSource,
});

const featureFlags = new GrowthBookFeatureFlagAdapter({
  clientKey: "YOUR_GROWTHBOOK_CLIENT_KEY",
  enableStreaming: true,
});

await featureFlags.init();
```

## Verificar Feature Flags

### Verificar Si Está Habilitado

```typescript
import { useAdapter, FeatureFlagPort } from "@nativefy/core";

function PremiumFeature() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const isPremiumEnabled = featureFlags.isEnabled("premium-feature");

  if (isPremiumEnabled) {
    return <PremiumComponent />;
  }

  return <StandardComponent />;
}
```

### Obtener Valor de Flag

```typescript
function ThemeSelector() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  // Obtener tema desde feature flag
  const theme = featureFlags.getValue<string>("app-theme", "light");

  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}
```

### Obtener Resultado Completo

```typescript
function FeatureBanner() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const result = featureFlags.getFeatureFlag<{ message: string; color: string }>(
    "welcome-banner"
  );

  if (result.enabled && result.value) {
    return (
      <Banner color={result.value.color}>
        {result.value.message}
      </Banner>
    );
  }

  return null;
}
```

### Obtener Múltiples Flags

```typescript
function FeatureGate() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const flags = featureFlags.getFeatureFlags([
    "premium-feature",
    "new-checkout",
    "dark-mode",
  ]);

  return (
    <View>
      {flags["premium-feature"].enabled && <PremiumButton />}
      {flags["new-checkout"].enabled && <NewCheckoutFlow />}
      {flags["dark-mode"].enabled && <DarkModeToggle />}
    </View>
  );
}
```

## Atributos del Usuario

### Establecer Atributos (Identificar Usuario)

```typescript
import { useAdapter, FeatureFlagPort } from "@nativefy/core";

function useAuth() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const login = async (user: User) => {
    // Establecer atributos del usuario para targeting
    featureFlags.setAttributes({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      roles: user.roles,
      country: user.country,
    });
  };

  const logout = async () => {
    // Limpiar atributos
    featureFlags.clearAttributes();
  };

  return { login, logout };
}
```

### Actualizar Atributos

```typescript
// Cuando el usuario actualiza su plan
featureFlags.setAttributes({
  ...featureFlags.getAttributes(),
  plan: "premium",
});

// Refrescar flags para aplicar nuevos targeting rules
await featureFlags.refresh();
```

## Casos de Uso Comunes

### Feature Gate Simple

```typescript
function NewFeatureScreen() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  if (!featureFlags.isEnabled("new-feature")) {
    return <ComingSoonScreen />;
  }

  return <NewFeatureContent />;
}
```

### Variantes de UI

```typescript
function CheckoutButton() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  // Obtener variante del botón
  const buttonVariant = featureFlags.getValue<string>("checkout-button-variant", "default");

  return (
    <Button variant={buttonVariant} onPress={handleCheckout}>
      Checkout
    </Button>
  );
}
```

### Configuración Dinámica

```typescript
function AppConfig() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const config = featureFlags.getFeatureFlag<{
    maxItems: number;
    enableSearch: boolean;
    theme: string;
  }>("app-config");

  return {
    maxItems: config.value?.maxItems ?? 10,
    enableSearch: config.value?.enableSearch ?? true,
    theme: config.value?.theme ?? "light",
  };
}
```

### A/B Testing

```typescript
function ProductList() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const layoutVariant = featureFlags.getFeatureFlag<string>("product-list-layout");

  if (layoutVariant.variant === "grid") {
    return <ProductGrid />;
  } else if (layoutVariant.variant === "list") {
    return <ProductList />;
  }

  return <ProductDefault />;
}
```

### Rollout Gradual

```typescript
function NewFeature() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  // GrowthBook maneja el rollout gradual automáticamente
  // basado en los atributos del usuario (id, email, etc.)
  const isEnabled = featureFlags.isEnabled("new-feature-rollout");

  if (isEnabled) {
    return <NewFeatureContent />;
  }

  return <OldFeatureContent />;
}
```

### UseCase con Feature Flags

```typescript
import { FeatureFlagPort, HttpClientPort } from "@nativefy/core";

export class GetProductsUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly featureFlags: FeatureFlagPort
  ) {}

  async execute(): Promise<Product[]> {
    // Verificar si usar nuevo endpoint
    const useNewAPI = this.featureFlags.isEnabled("new-products-api");

    const endpoint = useNewAPI ? "/api/v2/products" : "/api/v1/products";

    const response = await this.http.get<Product[]>(endpoint);
    return response.data;
  }
}
```

### Inicialización con Atributos

```typescript
import { useEffect } from "react";
import { useAdapter, FeatureFlagPort, StoragePort } from "@nativefy/core";

function AppInitializer() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");
  const storage = useAdapter<StoragePort>("storage");

  useEffect(() => {
    const initializeFlags = async () => {
      // Obtener usuario guardado
      const user = await storage.getItem<User>("user");

      if (user) {
        // Inicializar con atributos del usuario
        await featureFlags.init({
          id: user.id,
          email: user.email,
          plan: user.plan,
        });
      } else {
        // Inicializar sin atributos (usuario anónimo)
        await featureFlags.init();
      }
    };

    initializeFlags();
  }, []);

  return null;
}
```

### Refrescar Flags Manualmente

```typescript
function RefreshFlagsButton() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const handleRefresh = async () => {
    try {
      await featureFlags.refresh();
      console.log("Feature flags refreshed");
    } catch (error) {
      console.error("Error refreshing flags:", error);
    }
  };

  return <Button onPress={handleRefresh} title="Refresh Flags" />;
}
```

## Integración con Módulos

```typescript
import { createModule } from "@nativefy/core";
import { GetProductsUseCase } from "./usecases/GetProductsUseCase";

export const ProductsModule = createModule("products", "Products")
  .requires("featureflags", "http")
  .useCase("getProducts", (adapters) => {
    return new GetProductsUseCase(adapters.http, adapters.featureflags);
  })
  .build();
```

## API

### FeatureFlagPort

| Método | Descripción |
|--------|-------------|
| `init(attributes?)` | Inicializa el servicio |
| `getValue<T>(key, defaultValue?)` | Obtiene valor del flag |
| `isEnabled(key)` | Verifica si está habilitado |
| `getFeatureFlag<T>(key)` | Obtiene resultado completo |
| `getFeatureFlags(keys)` | Obtiene múltiples flags |
| `setAttributes(attributes)` | Actualiza atributos del usuario |
| `getAttributes()` | Obtiene atributos actuales |
| `refresh()` | Refresca flags desde servidor |
| `clearAttributes()` | Limpia atributos (logout) |

### FeatureFlagResult

```typescript
interface FeatureFlagResult<T> {
  value: T | null;        // Valor del flag
  enabled: boolean;       // Si está habilitado
  exists: boolean;        // Si el flag existe
  variant?: string;       // Variante asignada
  source?: string;        // Fuente de evaluación
}
```

### UserAttributes

```typescript
interface UserAttributes {
  id?: string;
  email?: string;
  name?: string;
  roles?: string[];
  plan?: string;
  country?: string;
  [key: string]: unknown; // Atributos personalizados
}
```

## Mejores Prácticas

### Nombres de Feature Flags

✅ **Buenos nombres:**
- `premium-feature`
- `new-checkout-flow`
- `dark-mode-toggle`
- `product-grid-layout`

❌ **Evitar:**
- `feature1`, `flag1` (muy genéricos)
- `PremiumFeature` (usar kebab-case)
- `new_feature` (usar kebab-case, no snake_case)

### Valores por Defecto

```typescript
// Siempre proporcionar valores por defecto
const theme = featureFlags.getValue<string>("app-theme", "light");
const maxItems = featureFlags.getValue<number>("max-items", 10);
const enabled = featureFlags.isEnabled("new-feature"); // false por defecto
```

### Atributos del Usuario

```typescript
// Establecer atributos relevantes para targeting
featureFlags.setAttributes({
  id: user.id,           // Para rollout gradual
  email: user.email,      // Para targeting por email
  plan: user.plan,       // Para features premium
  country: user.country, // Para features geográficas
  roles: user.roles,     // Para features por rol
});
```

### Refrescar Después de Cambios

```typescript
// Después de actualizar atributos importantes
featureFlags.setAttributes({ plan: "premium" });
await featureFlags.refresh(); // Aplicar nuevos targeting rules
```

## Notas

- **Inicialización**: Siempre llama `init()` antes de usar los flags
- **Atributos**: Los atributos del usuario se usan para targeting y rollout gradual
- **Streaming**: Requiere `react-native-sse` para actualizaciones en tiempo real
- **Evaluación Remota**: Requiere servidor proxy para mayor seguridad
- **Valores por Defecto**: Siempre proporciona valores por defecto para evitar errores
- **Errores**: Los errores se loguean pero no lanzan excepciones para no interrumpir el flujo

