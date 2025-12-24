# @natify/analytics-mixpanel

Analytics adapter for Natify Framework using `mixpanel-react-native`.

## Installation

```bash
pnpm add @natify/analytics-mixpanel mixpanel-react-native
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No additional configuration required.

## Configuration

### Get Mixpanel Token

1. Create an account on [Mixpanel](https://mixpanel.com)
2. Create a new project
3. Copy the **Project Token** from Settings → Project Settings

## Usage

### Basic Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { MixpanelAnalyticsAdapter } from "@natify/analytics-mixpanel";

const analyticsAdapter = new MixpanelAnalyticsAdapter({
  token: "YOUR_MIXPANEL_TOKEN",
});

const config = {
  analytics: analyticsAdapter,
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

### Advanced Configuration

```typescript
const analyticsAdapter = new MixpanelAnalyticsAdapter({
  token: "YOUR_MIXPANEL_TOKEN",
  autoInit: true, // Auto-initialize (default: true)
  optOutTrackingByDefault: false, // Whether to disable tracking by default
  trackAutomaticEvents: false, // Whether to track Mixpanel automatic events
  useSuperProperties: true, // Whether to use super properties (default: true)
});

// Initialize manually if autoInit is false
await analyticsAdapter.init();
```

## Event Tracking

### Simple Event

```typescript
import { useAdapter, AnalyticsPort } from "@natify/core";

function CheckoutButton() {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  const handleCheckout = async () => {
    // Process checkout...
    
    // Track event
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

### Common Events

```typescript
// Login
analytics.track("user_login", {
  method: "email",
  provider: "native",
});

// Signup
analytics.track("user_signup", {
  method: "email",
  plan: "free",
});

// Purchase
analytics.track("purchase_completed", {
  product_id: "123",
  product_name: "Premium Plan",
  price: 9.99,
  currency: "USD",
});

// User action
analytics.track("button_clicked", {
  button_name: "share",
  screen: "product_detail",
});
```

## User Identification

### Identify User

```typescript
import { useAdapter, AnalyticsPort } from "@natify/core";

function useAuth() {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  const login = async (user: User) => {
    // Identify user after login
    analytics.identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.plan,
      created_at: user.createdAt,
    });
  };

  const logout = async () => {
    // Clear session
    analytics.reset();
  };

  return { login, logout };
}
```

### Update User Properties

```typescript
// After updating profile
analytics.identify(userId, {
  email: updatedEmail,
  name: updatedName,
  plan: "premium", // Updated
});
```

## Screen Tracking

### Automatic Tracking

```typescript
import { useEffect } from "react";
import { useAdapter, AnalyticsPort } from "@natify/core";

function ProductDetailScreen({ productId }: { productId: string }) {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  useEffect(() => {
    // Track when screen mounts
    analytics.screen("ProductDetail", {
      product_id: productId,
      category: "electronics",
    });
  }, [productId]);

  return <View>...</View>;
}
```

### With React Navigation

```typescript
import { useFocusEffect } from "@react-navigation/native";
import { useAdapter, AnalyticsPort } from "@natify/core";

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

Super properties are automatically included in all events.

```typescript
const analytics = useAdapter<AnalyticsPort>("analytics");

// Set super properties (included in all events)
if (analytics instanceof MixpanelAnalyticsAdapter) {
  analytics.registerSuperProperties({
    app_version: "1.0.0",
    platform: Platform.OS,
    user_type: "premium",
  });
}
```

## Advanced Features

### Increment User Properties

```typescript
// Increment action counter
if (analytics instanceof MixpanelAnalyticsAdapter) {
  analytics.incrementUserProperty("products_viewed", 1);
  analytics.incrementUserProperty("total_spent", 99.99);
}
```

### Set User Properties (People)

```typescript
// Update user properties in Mixpanel People
if (analytics instanceof MixpanelAnalyticsAdapter) {
  analytics.setUserProperties({
    "$email": user.email,
    "$name": user.name,
    "plan": user.plan,
    "last_active": new Date().toISOString(),
  });
}
```

## Common Use Cases

### Tracking in UseCase

```typescript
import { AnalyticsPort } from "@natify/core";

export class PurchaseProductUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly analytics: AnalyticsPort
  ) {}

  async execute(productId: string): Promise<void> {
    // Track purchase start
    this.analytics.track("purchase_started", { product_id: productId });

    try {
      // Process purchase
      const result = await this.http.post("/purchase", { productId });

      // Track success
      this.analytics.track("purchase_completed", {
        product_id: productId,
        order_id: result.data.orderId,
        total: result.data.total,
      });
    } catch (error) {
      // Track error
      this.analytics.track("purchase_failed", {
        product_id: productId,
        error: error.message,
      });
      throw error;
    }
  }
}
```

### Funnel Tracking

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

### Error Tracking

```typescript
import { NatifyError } from "@natify/core";

function handleError(error: Error) {
  const analytics = useAdapter<AnalyticsPort>("analytics");

  analytics.track("error_occurred", {
    error_message: error.message,
    error_type: error.constructor.name,
    screen: currentScreen,
    ...(error instanceof NatifyError && {
      error_code: error.code,
      error_context: error.context,
    }),
  });
}
```

### Performance Tracking

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

// Usage
await trackPerformance("load_products", async () => {
  await loadProducts();
});
```

## Combining with Other Adapters (Composite)

```typescript
import { CompositeAnalyticsAdapter } from "@natify/core";
import { MixpanelAnalyticsAdapter } from "@natify/analytics-mixpanel";
// import { FirebaseAnalyticsAdapter } from "@natify/analytics-firebase";

const mixpanel = new MixpanelAnalyticsAdapter({
  token: "YOUR_MIXPANEL_TOKEN",
});

// const firebase = new FirebaseAnalyticsAdapter();

// Combine multiple adapters
const analytics = new CompositeAnalyticsAdapter([
  mixpanel,
  // firebase,
]);

// Initialize all
await analytics.init();

// Events are sent to all adapters
analytics.track("user_login", { method: "email" });
// ↑ Sent to Mixpanel (and Firebase if configured)
```

## Module Integration

```typescript
import { createModule } from "@natify/core";
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

| Method | Description |
|--------|-------------|
| `init()` | Initializes the service |
| `identify(userId, traits?)` | Identifies a user |
| `track(event, properties?)` | Records an event |
| `screen(name, properties?)` | Records a screen |
| `reset()` | Clears the session |

### MixpanelAnalyticsAdapter (Additional Methods)

| Method | Description |
|--------|-------------|
| `registerSuperProperties(properties)` | Sets super properties |
| `registerSuperProperty(key, value)` | Sets a super property |
| `incrementUserProperty(property, value?)` | Increments user property |
| `setUserProperties(properties)` | Sets user properties |
| `getMixpanelClient()` | Gets underlying Mixpanel client |

## Best Practices

### Event Names

✅ **Good names:**
- `checkout_completed`
- `user_login`
- `product_viewed`
- `button_clicked`

❌ **Avoid:**
- `event1`, `action`, `click` (too generic)
- `CheckoutCompleted` (use snake_case)
- `checkout-completed` (use snake_case, not kebab-case)

### Consistent Properties

```typescript
// Always include these common properties
analytics.track("purchase_completed", {
  // Identifiers
  user_id: userId,
  order_id: orderId,
  
  // Monetization
  revenue: 99.99,
  currency: "USD",
  
  // Context
  screen: "checkout",
  platform: Platform.OS,
  app_version: "1.0.0",
});
```

### Don't Track Sensitive Information

❌ **Avoid:**
```typescript
analytics.track("user_login", {
  password: userPassword, // ❌ NEVER
  credit_card: cardNumber, // ❌ NEVER
  ssn: userSSN, // ❌ NEVER
});
```

✅ **Use:**
```typescript
analytics.track("user_login", {
  method: "email",
  provider: "native",
  user_id: userId, // ✅ OK (not sensitive)
});
```

## Notes

- **Initialization**: The adapter initializes automatically by default. Use `autoInit: false` if you need manual control.
- **Super Properties**: Automatically included in all events when `useSuperProperties` is `true`.
- **People**: User properties sync with Mixpanel People.
- **Errors**: Errors are logged but don't throw exceptions to avoid interrupting app flow.
- **iOS**: Requires `pod install` after installation.
- **Android**: No additional configuration required.
