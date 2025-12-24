# @natify/error-reporting-sentry

Error Reporting adapter for Natify Framework using Sentry.

## Installation

```bash
pnpm add @natify/error-reporting-sentry @sentry/react-native
```

### Automatic Configuration

Sentry provides a wizard to automatically configure the project:

```bash
npx @sentry/wizard@latest -i reactNative
```

This command:
- Installs necessary dependencies
- Configures iOS (CocoaPods)
- Configures Android
- Creates configuration files

### Manual Configuration

#### iOS

```bash
cd ios && pod install && cd ..
```

#### Android

No additional configuration required after running the wizard.

## Configuration

### Get Sentry DSN

1. Create an account on [Sentry](https://sentry.io)
2. Create a new project (React Native)
3. Copy the **DSN** from Settings → Client Keys (DSN)

## Usage

### Basic Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { SentryErrorReportingAdapter } from "@natify/error-reporting-sentry";

const errorReporting = new SentryErrorReportingAdapter({
  dsn: "YOUR_SENTRY_DSN",
  environment: __DEV__ ? "development" : "production",
  release: "1.0.0",
});

// Initialize
await errorReporting.init();

const config = {
  errorReporting: errorReporting,
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
const errorReporting = new SentryErrorReportingAdapter({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  release: "1.0.0",
  debug: false, // Enable debug logs
  enableTracing: true, // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  attachScreenshot: true, // Capture screenshots on errors
  attachViewHierarchy: true, // Capture view hierarchy
});
```

## Capturing Errors

### Capture Exception

```typescript
import { useAdapter, ErrorReportingPort, SeverityLevel } from "@natify/core";

function MyComponent() {
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");

  const handleError = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      // Capture error with context
      errorReporting.captureException(error as Error, {
        screen: "ProductDetail",
        productId: "123",
        action: "purchase",
      });
    }
  };
}
```

### Capture Message

```typescript
// Informative message
errorReporting.captureMessage("User completed checkout", SeverityLevel.INFO, {
  orderId: "123",
  total: 99.99,
});

// Warning
errorReporting.captureMessage("API response time is slow", SeverityLevel.WARNING, {
  endpoint: "/api/products",
  responseTime: 5000,
});

// Critical error
errorReporting.captureMessage("Payment gateway unavailable", SeverityLevel.ERROR, {
  gateway: "stripe",
  retryCount: 3,
});
```

### With NatifyError

```typescript
import { NatifyError, NatifyErrorCode } from "@natify/core";

try {
  await operation();
} catch (error) {
  if (error instanceof NatifyError) {
    errorReporting.captureException(error, {
      errorCode: error.code,
      context: error.context,
    });
  } else {
    errorReporting.captureException(error as Error);
  }
}
```

## User Context

### Set User

```typescript
import { useAdapter, ErrorReportingPort } from "@natify/core";

function useAuth() {
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");

  const login = async (user: User) => {
    // Set user context
    errorReporting.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      plan: user.plan,
      roles: user.roles,
    });
  };

  const logout = async () => {
    // Clear context
    errorReporting.clearUser();
  };

  return { login, logout };
}
```

### Get Current User

```typescript
const currentUser = errorReporting.getUser();
if (currentUser) {
  console.log("Current user:", currentUser.id);
}
```

## Breadcrumbs

### Add Breadcrumbs

```typescript
// Before a critical operation
errorReporting.addBreadcrumb({
  message: "User clicked checkout button",
  category: "user-action",
  level: SeverityLevel.INFO,
  data: {
    screen: "Cart",
    itemsCount: 3,
  },
});

// During an operation
errorReporting.addBreadcrumb({
  message: "Calling payment API",
  category: "api",
  level: SeverityLevel.INFO,
  data: {
    endpoint: "/api/payment",
    method: "POST",
  },
});

// If there's an error, breadcrumbs help understand what happened before
try {
  await processPayment();
} catch (error) {
  errorReporting.captureException(error as Error);
  // Previous breadcrumbs are automatically included
}
```

### Automatic Breadcrumbs

Breadcrumbs are automatically added for:
- Navigation between screens
- HTTP calls (if configured)
- User interactions (clicks, etc.)

## Tags and Context

### Set Tags

```typescript
// Tags to filter errors in dashboard
errorReporting.setTags({
  app_version: "1.0.0",
  platform: Platform.OS,
  build_number: "123",
  feature: "checkout",
});

// Individual tag
errorReporting.setTag("user_plan", "premium");
```

### Set Context

```typescript
// Application context
errorReporting.setContext("app", {
  version: "1.0.0",
  build: "123",
  environment: "production",
});

// Device context
errorReporting.setContext("device", {
  model: Device.modelName,
  os: Platform.OS,
  osVersion: Platform.Version,
});

// Navigation context
errorReporting.setContext("navigation", {
  currentScreen: "ProductDetail",
  previousScreen: "ProductList",
  stackDepth: 3,
});
```

## Common Use Cases

### Global Error Boundary

```typescript
import { ErrorBoundary } from "@sentry/react-native";
import { NatifyProvider } from "@natify/core";

function App() {
  const errorReporting = new SentryErrorReportingAdapter({
    dsn: "YOUR_SENTRY_DSN",
  });

  await errorReporting.init();

  return (
    <ErrorBoundary>
      <NatifyProvider config={{ errorReporting, ...otherAdapters }}>
        <MyApp />
      </NatifyProvider>
    </ErrorBoundary>
  );
}
```

### Capture Errors in UseCase

```typescript
import { ErrorReportingPort, HttpClientPort } from "@natify/core";

export class PurchaseProductUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly errorReporting: ErrorReportingPort
  ) {}

  async execute(productId: string): Promise<void> {
    // Add breadcrumb before operation
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
      // Capture error with full context
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

### Performance Tracking

```typescript
const trackPerformance = async (operation: string, fn: () => Promise<void>) => {
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");
  const startTime = Date.now();

  try {
    await fn();
    const duration = Date.now() - startTime;

    // If too slow, report as warning
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

### Integration with BaseViewModel

```typescript
import { useBaseViewModel } from "@natify/core";
import { useAdapter, ErrorReportingPort } from "@natify/core";

function useMyViewModel() {
  const [baseState, { execute }] = useBaseViewModel();
  const errorReporting = useAdapter<ErrorReportingPort>("errorReporting");

  const loadData = useCallback(async () => {
    const result = await execute(async () => {
      // If there's an error, BaseViewModel captures it
      // But we can add additional context
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

### Capture Network Errors

```typescript
import { NatifyError, NatifyErrorCode } from "@natify/core";

// In an HTTP interceptor
const httpAdapter = new AxiosHttpAdapter("https://api.example.com", {}, {
  onResponseError: async (error) => {
    if (error.response?.status >= 500) {
      // Capture server errors
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

## Module Integration

```typescript
import { createModule } from "@natify/core";
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

| Method | Description |
|--------|-------------|
| `init(dsn?, options?)` | Initializes the service |
| `captureException(error, context?, level?)` | Captures an exception |
| `captureMessage(message, level?, context?)` | Captures a message |
| `setUser(user)` | Sets user context |
| `getUser()` | Gets user context |
| `addBreadcrumb(breadcrumb)` | Adds breadcrumb |
| `setTags(tags)` | Sets tags |
| `setTag(key, value)` | Sets a tag |
| `setContext(key, context)` | Sets context |
| `clearUser()` | Clears user context |
| `clearBreadcrumbs()` | Clears breadcrumbs |

### SeverityLevel

```typescript
enum SeverityLevel {
  FATAL = 'fatal',    // Critical error causing crash
  ERROR = 'error',    // Error requiring attention
  WARNING = 'warning', // Warning
  INFO = 'info',      // Information
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

## Best Practices

### Don't Capture Sensitive Information

❌ **Avoid:**
```typescript
errorReporting.captureException(error, {
  password: userPassword, // ❌ NEVER
  credit_card: cardNumber, // ❌ NEVER
  ssn: userSSN, // ❌ NEVER
});
```

✅ **Use:**
```typescript
errorReporting.captureException(error, {
  user_id: userId, // ✅ OK
  action: "checkout", // ✅ OK
  screen: "Payment", // ✅ OK
});
```

### Add Relevant Context

```typescript
// Always include useful context
errorReporting.captureException(error, {
  screen: currentScreen,
  action: "purchase",
  productId: productId,
  userId: currentUserId,
  appVersion: "1.0.0",
});
```

### Use Breadcrumbs for Debugging

```typescript
// Add breadcrumbs before critical operations
errorReporting.addBreadcrumb({
  message: "User entered payment details",
  category: "user-flow",
  data: { screen: "Payment" },
});

errorReporting.addBreadcrumb({
  message: "Validating payment",
  category: "business-logic",
});

// If there's an error, you'll see the entire flow in Sentry
```

### Set User After Login

```typescript
// Immediately after successful login
errorReporting.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

## Notes

- **Initialization**: Always call `init()` before using the adapter
- **DSN**: Get the DSN from Sentry dashboard
- **Environment**: Use different DSNs or environments for dev/staging/prod
- **Release**: Set the version for release tracking
- **Performance**: Enable `enableTracing` for performance monitoring
- **Screenshots**: `attachScreenshot` automatically captures screenshots on errors
- **iOS**: Requires `pod install` after installation
- **Android**: Wizard configures automatically
