# @nativefy-adapter/analytics-mixpanel

Adapter de Analytics para Nativefy Framework usando `mixpanel-react-native`.

## Instalación

```bash
pnpm add @nativefy-adapter/analytics-mixpanel mixpanel-react-native
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No requiere configuración adicional.

## Configuración

### Obtener Token de Mixpanel

1. Crea una cuenta en [Mixpanel](https://mixpanel.com)
2. Crea un nuevo proyecto
3. Copia el **Project Token** desde Settings → Project Settings

## Uso

### Configuración Básica

```typescript
import { NativefyProvider } from "@nativefy/core";
import { MixpanelAnalyticsAdapter } from "@nativefy-adapter/analytics-mixpanel";

const analyticsAdapter = new MixpanelAnalyticsAdapter({
  token: "YOUR_MIXPANEL_TOKEN",
});

const config = {
  analytics: analyticsAdapter,
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
const analyticsAdapter = new MixpanelAnalyticsAdapter({
  token: "YOUR_MIXPANEL_TOKEN",
  autoInit: true, // Inicializar automáticamente (default: true)
  optOutTrackingByDefault: false, // Si deshabilitar tracking por defecto
  trackAutomaticEvents: false, // Si trackear eventos automáticos de Mixpanel
  useSuperProperties: true, // Si usar super properties (default: true)
});

// Inicializar manualmente si autoInit es false
await analyticsAdapter.init();
```

## Tracking de Eventos

### Evento Simple

```typescript
import { useAdapter, AnalyticsPort } from "@nativefy/core";

function CheckoutButton() {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  const handleCheckout = async () => {
    // Procesar checkout...
    
    // Trackear evento
    analytics.track("checkout_completed", {
      total: 99.99,
      currency: "USD",
      items_count: 3,
      payment_method: "credit_card",
    });
  };

  return <Button onPress={handleCheckout} title="Checkout" />;
}
```

### Eventos Comunes

```typescript
// Login
analytics.track("user_login", {
  method: "email",
  provider: "native",
});

// Registro
analytics.track("user_signup", {
  method: "email",
  plan: "free",
});

// Compra
analytics.track("purchase_completed", {
  product_id: "123",
  product_name: "Premium Plan",
  price: 9.99,
  currency: "USD",
});

// Acción del usuario
analytics.track("button_clicked", {
  button_name: "share",
  screen: "product_detail",
});
```

## Identificación de Usuarios

### Identificar Usuario

```typescript
import { useAdapter, AnalyticsPort } from "@nativefy/core";

function useAuth() {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  const login = async (user: User) => {
    // Identificar usuario después del login
    analytics.identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.plan,
      created_at: user.createdAt,
    });
  };

  const logout = async () => {
    // Limpiar sesión
    analytics.reset();
  };

  return { login, logout };
}
```

### Actualizar Propiedades del Usuario

```typescript
// Después de actualizar perfil
analytics.identify(userId, {
  email: updatedEmail,
  name: updatedName,
  plan: "premium", // Actualizado
});
```

## Tracking de Pantallas

### Tracking Automático

```typescript
import { useEffect } from "react";
import { useAdapter, AnalyticsPort } from "@nativefy/core";

function ProductDetailScreen({ productId }: { productId: string }) {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  useEffect(() => {
    // Trackear cuando se monta la pantalla
    analytics.screen("ProductDetail", {
      product_id: productId,
      category: "electronics",
    });
  }, [productId]);

  return <View>...</View>;
}
```

### Con React Navigation

```typescript
import { useFocusEffect } from "@react-navigation/native";
import { useAdapter, AnalyticsPort } from "@nativefy/core";

function ProductListScreen() {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  useFocusEffect(
    useCallback(() => {
      analytics.screen("ProductList", {
        category: "all",
      });
    }, [])
  );

  return <View>...</View>;
}
```

## Super Properties

Las super properties se incluyen automáticamente en todos los eventos.

```typescript
const analytics = useAdapter<AnalyticsPort>("analytics");

// Establecer super properties (se incluyen en todos los eventos)
if (analytics instanceof MixpanelAnalyticsAdapter) {
  analytics.registerSuperProperties({
    app_version: "1.0.0",
    platform: Platform.OS,
    user_type: "premium",
  });
}
```

## Funciones Avanzadas

### Incrementar Propiedades del Usuario

```typescript
// Incrementar contador de acciones
if (analytics instanceof MixpanelAnalyticsAdapter) {
  analytics.incrementUserProperty("products_viewed", 1);
  analytics.incrementUserProperty("total_spent", 99.99);
}
```

### Establecer Propiedades del Usuario (People)

```typescript
// Actualizar propiedades del usuario en Mixpanel People
if (analytics instanceof MixpanelAnalyticsAdapter) {
  analytics.setUserProperties({
    "$email": user.email,
    "$name": user.name,
    "plan": user.plan,
    "last_active": new Date().toISOString(),
  });
}
```

## Casos de Uso Comunes

### Tracking en UseCase

```typescript
import { AnalyticsPort } from "@nativefy/core";

export class PurchaseProductUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly analytics: AnalyticsPort
  ) {}

  async execute(productId: string): Promise<void> {
    // Trackear inicio de compra
    this.analytics.track("purchase_started", { product_id: productId });

    try {
      // Procesar compra
      const result = await this.http.post("/purchase", { productId });

      // Trackear éxito
      this.analytics.track("purchase_completed", {
        product_id: productId,
        order_id: result.data.orderId,
        total: result.data.total,
      });
    } catch (error) {
      // Trackear error
      this.analytics.track("purchase_failed", {
        product_id: productId,
        error: error.message,
      });
      throw error;
    }
  }
}
```

### Tracking de Funnel

```typescript
function CheckoutFlow() {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  const step1_Cart = () => {
    analytics.track("checkout_step_1", { step: "cart" });
  };

  const step2_Shipping = () => {
    analytics.track("checkout_step_2", { step: "shipping" });
  };

  const step3_Payment = () => {
    analytics.track("checkout_step_3", { step: "payment" });
  };

  const step4_Complete = () => {
    analytics.track("checkout_step_4", { step: "complete" });
  };
}
```

### Tracking de Errores

```typescript
import { NativefyError } from "@nativefy/core";

function handleError(error: Error) {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  analytics.track("error_occurred", {
    error_message: error.message,
    error_type: error.constructor.name,
    screen: currentScreen,
    ...(error instanceof NativefyError && {
      error_code: error.code,
      error_context: error.context,
    }),
  });
}
```

### Tracking de Performance

```typescript
const trackPerformance = async (operation: string, fn: () => Promise<void>) => {
  const analytics = useAdapter<AnalyticsPort>("analytics");
  const startTime = Date.now();

  try {
    await fn();
    const duration = Date.now() - startTime;

    analytics.track("performance_metric", {
      operation,
      duration_ms: duration,
      status: "success",
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    analytics.track("performance_metric", {
      operation,
      duration_ms: duration,
      status: "error",
      error: error.message,
    });
  }
};

// Uso
await trackPerformance("load_products", async () => {
  await loadProducts();
});
```

## Combinar con Otros Adapters (Composite)

```typescript
import { CompositeAnalyticsAdapter } from "@nativefy/core";
import { MixpanelAnalyticsAdapter } from "@nativefy-adapter/analytics-mixpanel";
// import { FirebaseAnalyticsAdapter } from "@nativefy-adapter/analytics-firebase";

const mixpanel = new MixpanelAnalyticsAdapter({
  token: "YOUR_MIXPANEL_TOKEN",
});

// const firebase = new FirebaseAnalyticsAdapter();

// Combinar múltiples adapters
const analytics = new CompositeAnalyticsAdapter([
  mixpanel,
  // firebase,
]);

// Inicializar todos
await analytics.init();

// Los eventos se envían a todos los adapters
analytics.track("user_login", { method: "email" });
// ↑ Se envía a Mixpanel (y Firebase si está configurado)
```

## Integración con Módulos

```typescript
import { createModule } from "@nativefy/core";
import { PurchaseProductUseCase } from "./usecases/PurchaseProductUseCase";

export const ProductsModule = createModule("products", "Products")
  .requires("analytics", "http")
  .useCase("purchaseProduct", (adapters) => {
    return new PurchaseProductUseCase(adapters.http, adapters.analytics);
  })
  .build();
```

## API

### AnalyticsPort

| Método | Descripción |
|--------|-------------|
| `init()` | Inicializa el servicio |
| `identify(userId, traits?)` | Identifica un usuario |
| `track(event, properties?)` | Registra un evento |
| `screen(name, properties?)` | Registra una pantalla |
| `reset()` | Limpia la sesión |

### MixpanelAnalyticsAdapter (Métodos Adicionales)

| Método | Descripción |
|--------|-------------|
| `registerSuperProperties(properties)` | Establece super properties |
| `registerSuperProperty(key, value)` | Establece una super property |
| `incrementUserProperty(property, value?)` | Incrementa propiedad del usuario |
| `setUserProperties(properties)` | Establece propiedades del usuario |
| `getMixpanelClient()` | Obtiene cliente Mixpanel subyacente |

## Mejores Prácticas

### Nombres de Eventos

✅ **Buenos nombres:**
- `checkout_completed`
- `user_login`
- `product_viewed`
- `button_clicked`

❌ **Evitar:**
- `event1`, `action`, `click` (muy genéricos)
- `CheckoutCompleted` (usar snake_case)
- `checkout-completed` (usar snake_case, no kebab-case)

### Propiedades Consistentes

```typescript
// Siempre incluir estas propiedades comunes
analytics.track("purchase_completed", {
  // Identificadores
  user_id: userId,
  order_id: orderId,
  
  // Monetización
  revenue: 99.99,
  currency: "USD",
  
  // Contexto
  screen: "checkout",
  platform: Platform.OS,
  app_version: "1.0.0",
});
```

### No Trackear Información Sensible

❌ **Evitar:**
```typescript
analytics.track("user_login", {
  password: userPassword, // ❌ NUNCA
  credit_card: cardNumber, // ❌ NUNCA
  ssn: userSSN, // ❌ NUNCA
});
```

✅ **Usar:**
```typescript
analytics.track("user_login", {
  method: "email",
  provider: "native",
  user_id: userId, // ✅ OK (no es sensible)
});
```

## Notas

- **Inicialización**: El adapter se inicializa automáticamente por defecto. Usa `autoInit: false` si necesitas control manual.
- **Super Properties**: Se incluyen automáticamente en todos los eventos cuando `useSuperProperties` es `true`.
- **People**: Las propiedades del usuario se sincronizan con Mixpanel People.
- **Errores**: Los errores se loguean pero no lanzan excepciones para no interrumpir el flujo de la app.
- **iOS**: Requiere `pod install` después de instalar.
- **Android**: No requiere configuración adicional.

