# @natify/feature-flag-growthbook

Feature Flags adapter for Natify Framework using GrowthBook.

## Installation

```bash
pnpm add @natify/feature-flag-growthbook @growthbook/growthbook-react
```

### For Real-Time Streaming (Optional)

If you want to enable real-time feature flag updates:

```bash
pnpm add react-native-sse
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Android

No additional configuration required.

## Configuration

### Get GrowthBook Client Key

1. Create an account on [GrowthBook](https://www.growthbook.io)
2. Create a new project
3. Copy the **Client Key** from Settings → API Keys

## Usage

### Basic Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { GrowthBookFeatureFlagAdapter } from "@natify/feature-flag-growthbook";

const featureFlags = new GrowthBookFeatureFlagAdapter({
  clientKey: "YOUR_GROWTHBOOK_CLIENT_KEY",
});

const config = {
  featureflags: featureFlags,
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
const featureFlags = new GrowthBookFeatureFlagAdapter({
  clientKey: "YOUR_GROWTHBOOK_CLIENT_KEY",
  apiHost: "https://cdn.growthbook.io", // Optional
  enableDevMode: true, // For development
  enableStreaming: true, // Real-time updates
  enableRemoteEval: false, // Remote evaluation (requires proxy server)
  initialAttributes: {
    id: currentUserId,
    email: userEmail,
    plan: "premium",
  },
});

// Initialize
await featureFlags.init();
```

### With Streaming (Real-Time Updates)

```typescript
import { setPolyfills } from "@growthbook/growthbook";
import EventSource from "react-native-sse";

// Configure SSE polyfill for React Native
setPolyfills({
  EventSource: EventSource,
});

const featureFlags = new GrowthBookFeatureFlagAdapter({
  clientKey: "YOUR_GROWTHBOOK_CLIENT_KEY",
  enableStreaming: true,
});

await featureFlags.init();
```

## Check Feature Flags

### Check If Enabled

```typescript
import { useAdapter, FeatureFlagPort } from "@natify/core";

function PremiumFeature() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const isPremiumEnabled = featureFlags.isEnabled("premium-feature");

  if (isPremiumEnabled) {
    return <PremiumComponent />;
  }

  return <StandardComponent />;
}
```

### Get Flag Value

```typescript
function ThemeSelector() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  // Get theme from feature flag
  const theme = featureFlags.getValue<string>("app-theme", "light");

  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}
```

### Get Complete Result

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

### Get Multiple Flags

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

## User Attributes

### Set Attributes (Identify User)

```typescript
import { useAdapter, FeatureFlagPort } from "@natify/core";

function useAuth() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  const login = async (user: User) => {
    // Set user attributes for targeting
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
    // Clear attributes
    featureFlags.clearAttributes();
  };

  return { login, logout };
}
```

### Update Attributes

```typescript
// When user updates their plan
featureFlags.setAttributes({
  ...featureFlags.getAttributes(),
  plan: "premium",
});

// Refresh flags to apply new targeting rules
await featureFlags.refresh();
```

## Common Use Cases

### Simple Feature Gate

```typescript
function NewFeatureScreen() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  if (!featureFlags.isEnabled("new-feature")) {
    return <ComingSoonScreen />;
  }

  return <NewFeatureContent />;
}
```

### UI Variants

```typescript
function CheckoutButton() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  // Get button variant
  const buttonVariant = featureFlags.getValue<string>("checkout-button-variant", "default");

  return (
    <Button variant={buttonVariant} onPress={handleCheckout}>
      Checkout
    </Button>
  );
}
```

### Dynamic Configuration

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

### Gradual Rollout

```typescript
function NewFeature() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");

  // GrowthBook handles gradual rollout automatically
  // based on user attributes (id, email, etc.)
  const isEnabled = featureFlags.isEnabled("new-feature-rollout");

  if (isEnabled) {
    return <NewFeatureContent />;
  }

  return <OldFeatureContent />;
}
```

### UseCase with Feature Flags

```typescript
import { FeatureFlagPort, HttpClientPort } from "@natify/core";

export class GetProductsUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly featureFlags: FeatureFlagPort
  ) {}

  async execute(): Promise<Product[]> {
    // Check if use new endpoint
    const useNewAPI = this.featureFlags.isEnabled("new-products-api");

    const endpoint = useNewAPI ? "/api/v2/products" : "/api/v1/products";

    const response = await this.http.get<Product[]>(endpoint);
    return response.data;
  }
}
```

### Initialization with Attributes

```typescript
import { useEffect } from "react";
import { useAdapter, FeatureFlagPort, StoragePort } from "@natify/core";

function AppInitializer() {
  const featureFlags = useAdapter<FeatureFlagPort>("featureflags");
  const storage = useAdapter<StoragePort>("storage");

  useEffect(() => {
    const initializeFlags = async () => {
      // Get saved user
      const user = await storage.getItem<User>("user");

      if (user) {
        // Initialize with user attributes
        await featureFlags.init({
          id: user.id,
          email: user.email,
          plan: user.plan,
        });
      } else {
        // Initialize without attributes (anonymous user)
        await featureFlags.init();
      }
    };

    initializeFlags();
  }, []);

  return null;
}
```

### Manually Refresh Flags

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

## Module Integration

```typescript
import { createModule } from "@natify/core";
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

| Method | Description |
|--------|-------------|
| `init(attributes?)` | Initializes the service |
| `getValue<T>(key, defaultValue?)` | Gets flag value |
| `isEnabled(key)` | Checks if enabled |
| `getFeatureFlag<T>(key)` | Gets complete result |
| `getFeatureFlags(keys)` | Gets multiple flags |
| `setAttributes(attributes)` | Updates user attributes |
| `getAttributes()` | Gets current attributes |
| `refresh()` | Refreshes flags from server |
| `clearAttributes()` | Clears attributes (logout) |

### FeatureFlagResult

```typescript
interface FeatureFlagResult<T> {
  value: T | null;        // Flag value
  enabled: boolean;       // If enabled
  exists: boolean;        // If flag exists
  variant?: string;       // Assigned variant
  source?: string;        // Evaluation source
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
  [key: string]: unknown; // Custom attributes
}
```

## Best Practices

### Feature Flag Names

✅ **Good names:**
- `premium-feature`
- `new-checkout-flow`
- `dark-mode-toggle`
- `product-grid-layout`

❌ **Avoid:**
- `feature1`, `flag1` (too generic)
- `PremiumFeature` (use kebab-case)
- `new_feature` (use kebab-case, not snake_case)

### Default Values

```typescript
// Always provide default values
const theme = featureFlags.getValue<string>("app-theme", "light");
const maxItems = featureFlags.getValue<number>("max-items", 10);
const enabled = featureFlags.isEnabled("new-feature"); // false by default
```

### User Attributes

```typescript
// Set relevant attributes for targeting
featureFlags.setAttributes({
  id: user.id,           // For gradual rollout
  email: user.email,      // For email targeting
  plan: user.plan,       // For premium features
  country: user.country, // For geographic features
  roles: user.roles,     // For role-based features
});
```

### Refresh After Changes

```typescript
// After updating important attributes
featureFlags.setAttributes({ plan: "premium" });
await featureFlags.refresh(); // Apply new targeting rules
```

## Notes

- **Initialization**: Always call `init()` before using flags
- **Attributes**: User attributes are used for targeting and gradual rollout
- **Streaming**: Requires `react-native-sse` for real-time updates
- **Remote Evaluation**: Requires proxy server for better security
- **Default Values**: Always provide default values to avoid errors
- **Errors**: Errors are logged but don't throw exceptions to avoid interrupting flow
